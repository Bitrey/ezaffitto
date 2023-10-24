// https://bologna.bakeca.it/annunci/offro-camera/page/2/

import puppeteer from "puppeteer-extra";
import {
    BakecaRoot,
    RentalPost,
    RentalPostEventEmitter,
    RentalTypes
} from "./interfaces";
import moment from "moment";
import axios from "axios";

// Add stealth plugin and use defaults
import pluginStealth from "puppeteer-extra-plugin-stealth";
import { logger } from "./shared/logger";
import { Browser, Page } from "puppeteer-core";
import { config } from "./config";
import { wait } from "./shared/wait";
import EventEmitter from "events";

import "./healthcheckPing";
import { mkdir } from "fs/promises";
import path from "path";

// Use stealth
puppeteer.use(pluginStealth());

export const rentalPostEvent: RentalPostEventEmitter = new EventEmitter();

rentalPostEvent.on("bakecaPost", async post => {
    // debug posting with axios
    try {
        // TODO debug replace with RabbitMQ
        logger.warn("Posting to DB API");
        const { data } = await axios.post(
            config.DB_API_BASE_URL + "/rentalpost",
            post
        );
        logger.info(
            "Posted to DB API with _id " + data._id + " postId " + post.postId
        );
    } catch (err) {
        logger.error("Error while posting to DB API:");
        logger.error(err);
    }
});

export class Scraper {
    public static roomsUrl =
        "https://bologna.bakeca.it/annunci/offro-camera/inserzionistacase/privato/";

    private async scrape(url: string) {
        // const browser = await puppeteer.launch({ headless: "new" });
        // const browser = await puppeteer.launch({ headless: false });

        const browser = (await puppeteer.launch({
            headless: true,
            executablePath: "/usr/bin/google-chrome",
            args: [
                "--no-sandbox",
                "--disable-gpu",
                "--disable-notifications",
                "--disable-dev-shm-usage"
            ]
        })) as Browser;

        logger.debug("Browser connected for url " + url);

        const page = await browser.newPage();

        // Wait for a random time before navigating to a new web page
        await wait(Math.floor(Math.random() * 12 * 100) + 50);

        // fake headers
        await page.setExtraHTTPHeaders({
            "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "upgrade-insecure-requests": "1",
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-US,en;q=0.9,en;q=0.8"
        });

        // Limit requests
        await page.setRequestInterception(true);
        page.on("request", async request => {
            if (request.resourceType() == "image") {
                await request.abort();
            } else {
                await request.continue();
            }
        });

        await page.goto(url);
        await page.setViewport({ width: 1080, height: 1024 });

        let listEl, elements;
        try {
            listEl = await page.waitForSelector(".annuncio-elenco", {
                timeout: 10_000
            });
        } catch (err) {
            logger.error("Timeout");
            logger.error(err);
        }

        if (listEl) {
            elements = await listEl.$$(".annuncio-elenco > section");
        }

        if (!elements || elements.length === 0) {
            logger.error(
                elements
                    ? "No elements found"
                    : "No listEl '.annuncio-elenco' found"
            );
            await browser.close();
            return;
        } else {
            logger.debug(`Found ${elements.length} elements`);
        }

        // DEBUG SCREENSHOT
        try {
            await mkdir(path.join(process.cwd(), "/screenshots"), {
                recursive: true
            });
            await page.screenshot({
                path:
                    "screenshots/" +
                    (elements.length === 0
                        ? "/no_posts_fetched.png"
                        : "/end_page.png")
            });
        } catch (err) {
            logger.warn("Error while taking screenshot:");
            logger.warn(err);
        }

        // this is a for of with index of 'elements'
        for (const [i, e] of elements.entries()) {
            try {
                const text: string = await e.$eval(
                    "div.flex > div.flex > a",
                    e => e.textContent
                );
                if (text.toLowerCase().includes(config.AGENCY_TEXT)) {
                    logger.debug("Skipping agency post:", text);
                    continue;
                }
            } catch (err) {
                logger.debug("Err while checking for agency post:");
                logger.debug(err);
            }
            let date;
            try {
                const dateStr = await e.$eval(
                    "a > div:nth-child(3) > span.text-sm",
                    e => e.textContent
                );
                // timezone is not important since it's just a date
                date = moment(dateStr, "DD-MM-YYYY").toDate();
            } catch (err) {
                logger.error(err);
            }
            try {
                const content: BakecaRoot = JSON.parse(
                    await e.$eval("a > script", e => e.textContent)
                );

                const rawPrice = await e.$eval(
                    "strong.text--section.text-base.block",
                    e => e.textContent
                );
                const price: number | undefined =
                    typeof rawPrice === "string" && rawPrice.match(/\d+/)
                        ? parseFloat((<any>rawPrice).match(/\d+/)[0])
                        : undefined;

                const lwDesc = content.description.toLowerCase();

                const post: RentalPost = {
                    postId: content.productID,
                    source: "bakeca",
                    rawData: content,
                    isRental: true,
                    isForRent: true,
                    monthlyPrice: price,
                    images: content.image ? [content.image] : [],
                    description: content.description,
                    latitude: content.geo?.latitude,
                    longitude: content.geo?.longitude,
                    rentalType: (lwDesc.includes("singola")
                        ? "singleRoom"
                        : lwDesc.includes("doppia")
                        ? "doubleRoom"
                        : undefined) as RentalTypes,
                    date: date || new Date(),
                    url: content.url
                };

                logger.debug(
                    "Parsed post with id " +
                        post.postId +
                        ": " +
                        post.description?.slice(0, 30) +
                        "..."
                );
                rentalPostEvent.emit("bakecaPost", post);
            } catch (err) {
                logger.error("Error while parsing post:");
                logger.error(err);
            }
        }

        await wait(Math.floor(Math.random() * 12 * 100) + 50);
        await browser.close();
    }

    public async runScraper() {
        logger.info("Starting scraper...");

        logger.info("Starting scraping loop...");
        while (true) {
            const duration = config.GET_DELAY_BETWEEN_SCRAPES_MS();

            logger.info(
                `Scraping for ${(duration / 1000).toFixed(3)} seconds...`
            );

            for (const url of [Scraper.roomsUrl]) {
                try {
                    await this.scrape(url);
                    await wait(duration);
                } catch (err) {
                    logger.error(err);
                }
                // wait for duration + random time between 0 and 5 seconds
                await wait(Math.floor(Math.random() * 5000));
            }
        }
    }
}

async function run() {
    const scraper = new Scraper();
    while (true) {
        try {
            await scraper.runScraper();
            break;
        } catch (err) {
            logger.error("CRITICAL! Scraper crashed:");
            logger.error(err);
        }
    }
}

run();
