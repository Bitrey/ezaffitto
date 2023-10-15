import puppeteer from "puppeteer-extra";
import { Page, Protocol } from "puppeteer-core";
import pluginStealth from "puppeteer-extra-plugin-stealth";
import { ScrapedDataEventEmitter } from "./interfaces/events";
import EventEmitter from "events";
import { logger } from "./shared/logger";
import { wait } from "./shared/wait";
import { config } from "./config/config";
import { FbPost } from "./interfaces/FbPost";
import { extractor } from "./extractor";
// import { runProducer } from "./producer";
import moment, { Moment } from "moment";
import axios, { AxiosError } from "axios";
import { RentalPost } from "./interfaces/shared";
import { envs } from "./config/envs";

import "./healthcheckPing";
import { mkdir } from "fs/promises";
import { join } from "path";
import { cwd } from "process";

puppeteer.use(pluginStealth());

export const scrapedDataEvent: ScrapedDataEventEmitter = new EventEmitter();

scrapedDataEvent.on("scrapedData", async fbData => {
    // check if exists
    try {
        const res1 = await axios.get(
            config.DB_API_BASE_URL + "/rentalpost/text",
            { params: { text: fbData.text } }
        );
        const res2 = await axios.get(
            config.DB_API_BASE_URL + "/rentalpost/postid/" + fbData.id
        );
        if (res1.data || res2.data) {
            logger.warn(`Post ${fbData.id} already exists, skipping...`);
            return;
        }
    } catch (err) {
        logger.error("Error while checking if post already exists:");
        logger.error((err as AxiosError)?.response?.data || err);
        return;
    }

    logger.warn("Running debug API call for scrapedDataEvent");
    let post: RentalPost;
    try {
        const { data } = await axios.post(config.PARSER_API_BASE_URL, fbData);
        post = data;
    } catch (err) {
        logger.error("Error while parsing post:");
        logger.error(err);
        return;
    }

    // remove all undefined and null fields
    Object.keys(post).forEach(
        key =>
            [null, undefined].includes(post[key as keyof typeof post] as any) &&
            delete post[key as keyof typeof post]
    );

    try {
        if (post.address) {
            const coords = await Scraper.geolocate(post.address);
            if (coords) {
                post.latitude = coords.latitude;
                post.longitude = coords.longitude;
            }
        }
    } catch (err) {
        logger.error("Error while geolocating address:");
        logger.error(err);
    }

    try {
        const { data } = await axios.post(
            config.DB_API_BASE_URL + "/rentalpost",
            {
                ...post,
                postId: fbData.id,
                source: "facebook",
                date: fbData.date,
                images: fbData.images || [],
                authorUrl: fbData.authorUrl,
                // latitude: coords?.latitude,
                authorUsername: fbData.authorName,
                // longitude: coords?.longitude,
                url: fbData.postUrl,
                rawData: fbData
            }
        );
        logger.info(
            "Saved post with postId " + data.postId + " _id " + data._id
        );
    } catch (err) {
        logger.error("Error while saving post:");
        logger.error((err as AxiosError)?.response?.data || err);
    }
});

export class Scraper {
    public static fbGroupUrls: readonly string[] = [
        "https://www.facebook.com/groups/172693152831725/?locale=it_IT", // privato, enorme
        "https://www.facebook.com/groups/AffittoBologna/?locale=it_IT",
        "https://www.facebook.com/groups/bolognaaffitti/?locale=it_IT",
        "https://www.facebook.com/groups/4227281414051454/?locale=it_IT",
        "https://www.facebook.com/groups/affitti.a.bologna/?locale=it_IT",
        "https://www.facebook.com/groups/affittobolonga/?locale=it_IT",
        "https://www.facebook.com/groups/488856121488809/?locale=it_IT"
        // "https://www.facebook.com/groups/114050352266007/?locale=it_IT", // privato
    ];

    private cookiesCache: Protocol.Network.Cookie[] | null = null;
    private cookiesCacheDate: Moment | null = null;
    private loginBanDate: Moment | null = null;
    private startDate: Moment | null = null;
    private endDate: Moment | null = null;

    private setStartEndDate(durationMs: number) {
        this.startDate = moment();
        this.endDate = moment(this.startDate).add(durationMs, "milliseconds");
    }

    public static async geolocate(
        address: string,
        country = "IT",
        region = "Bologna"
    ): Promise<{ latitude: number; longitude: number } | null> {
        const params = {
            access_key: envs.GEOLOCATION_API_KEY,
            query: address,
            country: country,
            region,
            limit: 1,
            output: "json"
        };

        try {
            const { data } = await axios.get(
                "http://api.positionstack.com/v1/forward",
                { params }
            );

            if (data.data.length === 0) {
                logger.warn(`No results found for address ${address}`);
                return null;
            }

            const { latitude, longitude } = data.data[0];

            return { latitude, longitude };
        } catch (err) {
            logger.error("Error while geolocating address");
            logger.error((err as AxiosError).response?.data || err);
            throw new Error("GEOLOCATION_API_FAILED"); // TODO change with custom error
        }
    }

    private async scrape(groupUrl: string, durationMs: number) {
        // new date
        const scrapeId = moment().format("YYYY-MM-DD_HH-mm-ss");
        // await mkdir(join(cwd(), "/screenshots/" + scrapeId), {
        //     recursive: true
        // });

        this.setStartEndDate(durationMs);

        logger.debug(
            `Starting scrape for groupUrl ${groupUrl}${this.getElapsedStr()}`
        );
        logger.debug(
            `Start date is ${this.startDate!.format(
                "HH:mm:ss"
            )}, durationMs=${durationMs} => endDate is ${this.endDate!.format(
                "HH:mm:ss"
            )}, total duration: ${this.endDate!.diff(
                this.startDate,
                "seconds"
            )}s`
        );

        // const browser = await puppeteer.launch({ headless: "new" });
        // const browser = await puppeteer.launch({ headless: false });

        const browser = await puppeteer.launch({
            headless: true,
            executablePath: "/usr/bin/google-chrome",
            args: [
                "--no-sandbox",
                "--disable-gpu",
                "--disable-notifications",
                "--disable-dev-shm-usage"
            ]
        });

        logger.debug(
            "Browser connected for groupUrl " + groupUrl + this.getElapsedStr()
        );

        const page: Page = await browser.newPage();

        await page.setRequestInterception(true);

        const urls: string[] = [];

        page.on("request", interceptedRequest => {
            if (interceptedRequest.isInterceptResolutionHandled()) return;
            if (interceptedRequest.url().includes("graphql")) {
                urls.push(interceptedRequest.url());
            }

            interceptedRequest.continue();
        });

        let fetchedPosts = 0;

        page.on("response", async response => {
            if (urls.includes(response.url())) {
                let obj;
                try {
                    obj = await response.json();
                } catch (err) {
                    // map text to json
                    const txt = await response.text();
                    const text = `[${txt.replace(new RegExp("\n", "g"), ",")}]`;
                    obj = JSON.parse(text);
                }
                const arr = Array.isArray(obj) ? obj : [obj];
                for (const elem of arr) {
                    const props = extractor(elem) as FbPost;

                    // delete undefined props
                    Object.keys(props).forEach(key => {
                        if (
                            [null, undefined].includes(
                                props[key as keyof typeof props] as any
                            )
                        ) {
                            delete props[key as keyof typeof props];
                        }
                    });

                    // check if props contains each requiredProps
                    const missingProps = config.REQUIRED_PROPS.filter(
                        p => !(p in props)
                    );
                    if (missingProps.length == 0) {
                        // TODO implement save in case of error?

                        scrapedDataEvent.emit("scrapedData", props);
                        logger.debug(
                            "Emitting new post with id " +
                                props.id +
                                this.getElapsedStr()
                        );
                        fetchedPosts++;
                    } else {
                        logger.debug(
                            "Missing props: " +
                                missingProps.join(", ") +
                                this.getElapsedStr()
                        );
                    }
                }
            }
        });

        const hasLoginCookies =
            this.cookiesCache &&
            this.cookiesCacheDate!.diff(moment(), "minutes") <
                config.GET_COOKIE_CACHE_DURATION_MINUTES();

        if (hasLoginCookies) {
            await page.setCookie(
                ...(this.cookiesCache as Protocol.Network.Cookie[])
            );
            logger.debug(
                "Using cached cookies for groupUrl " +
                    groupUrl +
                    this.getElapsedStr()
            );
        }

        await page.goto(groupUrl, { timeout: 10000 });
        await page.setViewport({ width: 1080, height: 1024 });

        // DEBUG SCREENSHOT
        // await page.screenshot({
        //     path: "screenshots/" + scrapeId + "/main_page.png"
        // });

        // check config.GET_COOKIE_CACHE_DURATION_MINUTES
        if (!hasLoginCookies) {
            logger.debug(
                "Getting new cookies for groupUrl " +
                    groupUrl +
                    this.getElapsedStr()
            );

            // DEBUG SCREENSHOT
            // await page.screenshot({
            //     path: "screenshots/" + scrapeId + "/new_cookies.png"
            // });

            // click refuse cookie button by selecting aria-label
            const cookieButtonSelector =
                '[aria-label="Rifiuta cookie facoltativi"]';

            // if (page.$(cookieButtonSelector) == null)
            try {
                await page.waitForSelector(cookieButtonSelector, {
                    timeout: 10_000
                });
                await wait(Math.random() * 1000);
                await page.click(cookieButtonSelector);
            } catch (err) {
                logger.warn(
                    "Cookie button not found for groupUrl " +
                        groupUrl +
                        this.getElapsedStr()
                );
            }

            // click close login button by selecting aria-label
            const closeLoginButtonSelector = '[aria-label="Chiudi"]';

            // if (page.$(closeLoginButtonSelector) == null)
            try {
                await page.waitForSelector(closeLoginButtonSelector, {
                    timeout: 10_000
                });
                await wait(Math.random() * 1000);
                await page.click(closeLoginButtonSelector);
            } catch (err) {
                logger.warn(
                    "Close login button not found for groupUrl " +
                        groupUrl +
                        this.getElapsedStr()
                );
            }

            logger.debug(
                "Typing login credentials for groupUrl " +
                    groupUrl +
                    this.getElapsedStr()
            );

            // DEBUG SCREENSHOT
            // await page.screenshot({
            //     path: "screenshots/" + scrapeId + "/login_page.png"
            // });

            const emailSelector = 'input[name="email"]';
            const passSelector = 'input[name="pass"]';

            await page.waitForSelector(emailSelector);
            await wait(Math.random() * 1000);
            await page.type(emailSelector, envs.FB_ACCOUNT_EMAIL, {
                delay: Math.floor(Math.random() * 100) + 50
            });
            await wait(Math.random() * 1000);
            await page.type(passSelector, envs.FB_ACCOUNT_PASSWORD, {
                delay: Math.floor(Math.random() * 100) + 50
            });
            await wait(Math.random() * 1000);

            // DEBUG SCREENSHOT
            // await page.screenshot({
            //     path: "screenshots/" + scrapeId + "/login_typed.png"
            // });

            await page.keyboard.press("Enter");

            try {
                await page.waitForNavigation({
                    timeout: 10000,
                    waitUntil: "domcontentloaded"
                });

                this.cookiesCache = await page.cookies();
                this.cookiesCacheDate = moment();

                if ((await page.$('[aria-label="Password"]')) != null) {
                    this.loginBanDate = moment();
                    logger.warn(
                        "Login failed (ban?) for groupUrl " +
                            groupUrl +
                            this.getElapsedStr()
                    );

                    // DEBUG SCREENSHOT
                    // await page.screenshot({
                    //     path: "screenshots/" + scrapeId + "/login_ban.png"
                    // });
                } else {
                    logger.debug(
                        "Logged in for groupUrl " +
                            groupUrl +
                            this.getElapsedStr()
                    );

                    // DEBUG SCREENSHOT
                    // await page.screenshot({
                    //     path: "screenshots/" + scrapeId + "/logged_in.png"
                    // });
                }
            } catch (err) {
                logger.warn(
                    "Error while trying to login (already logged in?)" +
                        this.getElapsedStr()
                );

                // DEBUG SCREENSHOT
                // await page.screenshot({
                //     path: "screenshots/" + scrapeId + "/login_failed.png"
                // });
            }
        }

        const [span1] = await page.$x("//span[contains(., 'Più pertinenti')]");
        if (!span1) {
            logger.warn(
                "span1 not found for groupUrl " +
                    groupUrl +
                    this.getElapsedStr()
            );
        } else {
            await span1.click();
            const [span2] = await page.$x("//span[contains(., 'Nuovi post')]");
            if (!span2) {
                logger.warn(
                    "span2 not found for groupUrl " +
                        groupUrl +
                        this.getElapsedStr()
                );
            } else {
                await span2.click();
                logger.debug(
                    "Sorting by new posts for groupUrl " +
                        groupUrl +
                        this.getElapsedStr()
                );
            }
        }

        logger.info(
            "Just logged in: resetting startDate" + this.getElapsedStr()
        );
        this.setStartEndDate(durationMs);

        // DEBUG SCREENSHOT
        // await page.screenshot({
        //     path: "screenshots/" + scrapeId + "/sorted_by_new.png"
        // });

        while (moment().isBefore(this.endDate)) {
            await wait(Math.random() * 500 + 500);
            // await page.keyboard.press("PageDown");
            await page.mouse.wheel({
                deltaY: Math.floor(Math.random() * 500) + 500
            });
            await wait(Math.random() * 500 + 500);
        }

        logger.debug(
            "Closing browser for groupUrl " + groupUrl + this.getElapsedStr()
        );

        await browser.close();
        logger.info(
            "Scrape finished for groupUrl " + groupUrl + this.getElapsedStr()
        );

        if (fetchedPosts == 0) {
            logger.warn(
                "No posts fetched for groupUrl " +
                    groupUrl +
                    this.getElapsedStr()
            );
        }

        this.startDate = null;
        this.endDate = null;
    }

    private getElapsedStr() {
        return (
            " - startDate: " +
            this.startDate?.format("HH:mm:ss") +
            " - endDate: " +
            this.endDate?.format("HH:mm:ss") +
            " - elapsed: " +
            (moment()?.diff(this.startDate, "milliseconds") / 1000).toFixed(3) +
            "s/" +
            (
                (this.endDate?.diff(this.startDate, "milliseconds") || 0) / 1000
            ).toFixed(3) +
            "s"
        );
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

            logger.info(
                `Scraping for ${(duration / 1000).toFixed(3)} seconds...`
            );

            for (const groupUrl of Scraper.fbGroupUrls) {
                try {
                    await this.scrape(groupUrl, duration);
                } catch (err) {
                    logger.error(err);
                }
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
