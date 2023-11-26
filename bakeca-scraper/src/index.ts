import puppeteer from "puppeteer-extra";
import { Browser } from "puppeteer-core";
import pluginStealth from "puppeteer-extra-plugin-stealth";
import EventEmitter from "events";
import { logger } from "./shared/logger";
import { wait } from "./shared/wait";
import moment from "moment";
import axios, { AxiosError } from "axios";
import exitHook from "async-exit-hook";

import * as fastq from "fastq";
import type { queueAsPromised } from "fastq";

import "./healthcheckPing";
import { mkdir, readFile } from "fs/promises";
import { BakecaRoot, RentalPostEventEmitter, UrlTask } from "./interfaces";
import { config } from "./config";
import {
    CityUrls,
    EzaffittoCity,
    RentalPost,
    RentalTypes
} from "./interfaces/shared";

puppeteer.use(pluginStealth());

export const bakecaEventEmitter: RentalPostEventEmitter = new EventEmitter();

bakecaEventEmitter.on("bakecaPost", async post => {
    logger.warn("Running debug API call for bakecaEventEmitter");

    // remove all undefined and null fields
    Object.keys(post).forEach(
        key =>
            [null, undefined].includes(post[key as keyof typeof post] as any) &&
            delete post[key as keyof typeof post]
    );

    if (post.latitude && post.longitude) {
        try {
            const coords = await Scraper.reverseGeolocate(
                post.latitude,
                post.longitude
            );
            if (coords) {
                post.address = coords.formattedAddress;
                post.latitude = coords.latitude;
                post.longitude = coords.longitude;
            }
        } catch (err) {
            logger.error(
                "Error while geolocating address " +
                    post.latitude +
                    "," +
                    post.longitude +
                    " for post " +
                    post.postId +
                    ":"
            );
            logger.error(err);
            delete post.address;
        }
    } else {
        delete post.address;
        delete post.latitude;
        delete post.longitude;
    }

    try {
        const { data } = await axios.post(
            config.DB_API_BASE_URL + "/rentalpost",
            post
        );
        logger.info(
            "Saved post with postId " + data.postId + " _id " + data._id
        );
    } catch (err) {
        logger.error("Error while saving post with id " + post.postId + ":");
        logger.error((err as AxiosError)?.response?.data || err);
    }
});

export class Scraper {
    public static async getUrl(city: string): Promise<string | null> {
        const urls: CityUrls[] = JSON.parse(
            await readFile(config.URLS_JSON_PATH, { encoding: "utf-8" })
        );
        return urls.find(e => e.city === city)?.urls[0]?.url || null;
    }

    public static async getCities(): Promise<EzaffittoCity[]> {
        const urls: CityUrls[] = JSON.parse(
            await readFile(config.URLS_JSON_PATH, { encoding: "utf-8" })
        );
        return urls.map(e => e.city);
    }

    private static browser: Browser | null = null;

    public async closeBrowser() {
        await Scraper.browser?.close();
    }

    public static async reverseGeolocate(
        lat: number,
        lng: number
    ): Promise<{
        formattedAddress: string;
        latitude: number;
        longitude: number;
    } | null> {
        try {
            const { data } = await axios.get(
                config.DB_API_BASE_URL + "/geolocate/reverse",
                { params: { lat, lng } }
            );

            return data;
        } catch (err) {
            logger.error("Error while reverse geolocating query");
            logger.error((err as AxiosError).response?.data || err);
            throw new Error("Geolocation failed"); // TODO change with custom error
        }
    }

    private async init() {
        Scraper.browser = await puppeteer.launch({
            headless: "new",
            executablePath: "/usr/bin/google-chrome",
            args: [
                "--no-sandbox",
                "--disable-gpu",
                "--disable-notifications",
                "--disable-dev-shm-usage",
                "--disable-setuid-sandbox",
                "--disable-accelerated-2d-canvas",
                "--disable-web-security"
            ]
        });
    }

    private static async sendPanic(message: string): Promise<void> {
        await axios.post(config.DB_API_BASE_URL + "/panic", {
            service: "bakeca-scraper",
            message
        });
    }

    private async scrape(url: string, city: EzaffittoCity) {
        if (!Scraper.browser) {
            logger.info("Browser is null, initializing...");
            await this.init();
        }

        const page = await Scraper.browser?.newPage();

        // const scrapeId = moment().format("YYYY-MM-DD_HH-mm-ss");

        if (!page) {
            logger.error("CRITICAL! Page is null for url " + url);
            await Scraper.sendPanic("Page is null for url " + url);
            process.exit(1);
        }

        logger.info(`Starting scrape for url ${url}`);

        await page.setViewport({ width: 1080, height: 1024 });

        await mkdir(config.SCREENSHOTS_PATH, {
            recursive: true
        });
        await page.setRequestInterception(true);

        page.on("request", async request => {
            try {
                if (request.isInterceptResolutionHandled()) {
                    return;
                }
                if (request.resourceType() === "image") {
                    request.abort();
                    return;
                }

                await request.continue();
            } catch (err) {
                logger.error("Error while intercepting request:");
                logger.error(err);
            }
        });

        await page.goto(url);

        try {
            await page.waitForSelector(".annuncio-elenco", { timeout: 10_000 });
        } catch (err) {
            logger.error("Error while waiting for .annuncio-elenco:");
            logger.error(err);
            await page.screenshot({
                path: "screenshots" + "/annuncio-elenco_not_found.png"
            });
            page.removeAllListeners("request");
            page.removeAllListeners("response");
            await Scraper.sendPanic(
                `Error while waiting for .annuncio-elenco for url ${url} - exiting`
            );
            await page.close();
            process.exit(1);
        }

        await page.screenshot({
            path: "screenshots/start_page.png"
        });

        const elements = await page.$$(".annuncio-elenco > section");

        if (elements.length === 0) {
            logger.error("No elements found!");
            await page.screenshot({
                path: "screenshots/no_elements_found.png"
            });
        } else {
            logger.debug(`Found ${elements.length} elements`);
        }

        const tasks: UrlTask[] = [];

        // print all elements
        elements.forEach(async (e, i) => {
            try {
                const text: string = await e.$eval(
                    "div.flex > div.flex > a",
                    e => e.textContent
                );
                if (text.toLowerCase().includes(config.AGENCY_TEXT)) {
                    return;
                }
            } catch (err) {
                // DEBUG log
            }
            let date;
            try {
                const dateStr = await e.$eval(
                    "a > div:nth-child(3) > span.text-sm",
                    e => e.textContent
                );
                const momentDate = moment(dateStr, "DD-MM-YYYY");
                if (momentDate.isValid()) {
                    date = momentDate.toDate();
                }
            } catch (err) {
                logger.warn("Error while getting date:");
                logger.warn(err);
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
                    ezaffittoCity: city,
                    monthlyPrice: price,
                    rawData: content,
                    source: "bakeca",
                    isRental: true,
                    isForRent: true,
                    images: content.image ? [content.image] : [],
                    description: content.description,
                    latitude: content.geo?.latitude,
                    longitude: content.geo?.longitude,
                    rentalType:
                        lwDesc.includes("singola") ||
                        content.url.includes("singola")
                            ? RentalTypes.SINGLE_ROOM
                            : lwDesc.includes("doppia") ||
                              content.url.includes("doppia")
                            ? RentalTypes.DOUBLE_ROOM
                            : RentalTypes.OTHER,
                    date: date || new Date(),
                    url: content.url
                };

                logger.debug(
                    "Checking if post already exists with text " +
                        content.description.slice(0, 30) +
                        "... and id " +
                        content.productID
                );

                let existsOrError = false;

                try {
                    const res1 = await axios.post(
                        config.DB_API_BASE_URL + "/rentalpost/text",
                        { text: content.description, source: "bakeca" }
                    );
                    const res2 = await axios.get(
                        config.DB_API_BASE_URL +
                            "/rentalpost/postid/" +
                            content.productID
                    );
                    const p =
                        res1.data &&
                        typeof res1.data === "object" &&
                        Object.keys(res1.data).length > 0
                            ? res1.data
                            : res2.data;
                    if (p) {
                        logger.debug(
                            `Post ${
                                content.productID
                            } (${content.description.slice(
                                0,
                                30
                            )}...) already exists with _id ${p._id} - postId ${
                                p.postId
                            }, skipping...`
                        );
                        existsOrError = true;
                    }
                } catch (err) {
                    logger.error(
                        `Error while checking if post ${content.productID} already exists:`
                    );
                    logger.error((err as AxiosError)?.response?.data || err);
                    existsOrError = true;
                }

                if (!existsOrError) {
                    tasks.push({ post, postUrl: content.url });
                }
            } catch (err) {
                logger.error("Error while parsing element:");
                logger.error(err);
            }
        });

        await wait(config.DELAY_AFTER_SCRAPES_MS);

        // remove page listeners
        page.removeAllListeners("request");
        page.removeAllListeners("response");

        logger.debug("Closing page...");
        await page.close();

        // create queue with max 3 concurrent workers
        const q: queueAsPromised<UrlTask> = fastq.promise<UrlTask>(
            this.scrapeTask.bind(this),
            3
        );

        for (const task of tasks) {
            // add tasks to queue
            q.push(task);
        }

        // await the end of the queue
        await q.drained();

        logger.info(
            `Scrape finished with ${elements.length} posts for city ${city}`
        );
    }

    private async scrapeTask(task: UrlTask) {
        try {
            if (!Scraper.browser) {
                throw new Error("Browser not initialized!");
            }

            const url = task.postUrl;

            logger.debug("Browser connected for task url " + url);

            const page = await Scraper.browser.newPage();

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
                if (request.isInterceptResolutionHandled()) {
                    return;
                }
                if (request.resourceType() == "image") {
                    await request.abort();
                } else {
                    await request.continue();
                }
            });

            await page.goto(url);
            await page.setViewport({ width: 1080, height: 1024 });

            // wait for description to load
            // No need for a try-catch block, fastq handles errors automatically

            await page.waitForSelector("#annuncio_descrizione", {
                timeout: 2_000
            });
            const description = await page.$eval(
                "#annuncio_descrizione",
                e => e.textContent
            );

            const district = await page.$(
                "#annuncio_metacaratteristiche ~ div.flex div:nth-child(4)"
            );
            const districtStr = (await district?.evaluate(
                e => e.textContent
            )) as string | undefined;
            const districtName = districtStr?.split("\n")[1].trim();

            const images = await page.$$(
                "div#annuncio_thumbnails div.relative div.glide__track ul.glide__slides li.glide__slide div img"
            );
            const imagesSrc = images
                .filter(e => e)
                .map(e => e.evaluate(e => e.src));
            const imagesSrcResolved = (await Promise.all(
                imagesSrc
            )) as string[];

            await wait(config.DELAY_AFTER_TASKS_MS);

            // remove page listeners
            page.removeAllListeners("request");
            page.removeAllListeners("response");

            logger.debug("Closing page...");
            await page.close();

            const post: RentalPost = {
                ...task.post,
                description,
                zone: districtName,
                images: imagesSrcResolved
            };

            bakecaEventEmitter.emit("bakecaPost", post);
        } catch (err) {
            logger.error("Error while scraping task:");
            logger.error(err);
            throw err;
        }
    }

    public async runScraper() {
        if (!config.DEBUG_RUN_SCRAPER) {
            logger.warn("DEBUG_RUN_SCRAPER is false, not running scraper");
            return;
        }

        logger.info("Starting scraper...");
        // await runProducer();

        logger.info("Starting scraping loop...");
        while (true) {
            const duration = config.GET_DELAY_BETWEEN_SCRAPES_MS();

            for (const city of await Scraper.getCities()) {
                logger.info(
                    `Scraping for ${(duration / 1000).toFixed(
                        3
                    )} seconds city ${city}...`
                );

                const url = await Scraper.getUrl(city);

                if (!url) {
                    logger.error("No url found for city " + city);
                    continue;
                }

                try {
                    await this.scrape(url, city);
                } catch (err) {
                    logger.error(
                        "Error while scraping url " +
                            url +
                            " for city " +
                            city +
                            ":"
                    );
                    logger.error(err);
                }
                await wait(config.GET_DELAY_BETWEEN_SCRAPES_MS());
            }
        }
    }
}

async function run() {
    const scraper = new Scraper();

    let doScrape = true;

    exitHook(async done => {
        logger.info(`Closing browser...`);
        await scraper.closeBrowser();
        logger.info(`Browser closed`);
        doScrape = false;
        done();
    });

    while (doScrape) {
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
