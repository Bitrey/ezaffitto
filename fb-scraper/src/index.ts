import puppeteer from "puppeteer-extra";
import { Browser, Page } from "puppeteer-core";
import pluginStealth from "puppeteer-extra-plugin-stealth";
import { ScrapedDataEventEmitter } from "./interfaces/events";
import EventEmitter from "events";
import { logger } from "./shared/logger";
import { wait } from "./shared/wait";
import { config } from "./config/config";
import { FbPost } from "./interfaces/FbPost";
import { extractor } from "./extractor";
import moment, { Moment } from "moment";
import axios, { AxiosError, isAxiosError } from "axios";
import { CityUrls, EzaffittoCity, RentalPost } from "./interfaces/shared";
import { envs } from "./config/envs";
import exitHook from "async-exit-hook";

import "./healthcheckPing";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { Cookie } from "./interfaces/Cookie";
import { mapCookiesToPuppeteer } from "./misc/mapCookiesToPuppeteer";
import { existsSync } from "fs";
import path from "path";

puppeteer.use(pluginStealth());

export const scrapedDataEvent: ScrapedDataEventEmitter = new EventEmitter();

type GroupQueue = {
    [city in EzaffittoCity]: string[];
};

scrapedDataEvent.on("scrapedData", async ({ fbData, city }) => {
    // check if exists
    logger.debug(
        "Checking if post already exists with text " +
            fbData.text.slice(0, 30) +
            "... and id " +
            fbData.id
    );

    try {
        const res1 = await axios.post(
            config.DB_API_BASE_URL + "/rentalpost/text",
            { text: fbData.text, source: "facebook" }
        );
        const res2 = await axios.get(
            config.DB_API_BASE_URL + "/rentalpost/postid/" + fbData.id
        );
        const p =
            res1.data &&
            typeof res1.data === "object" &&
            Object.keys(res1.data).length > 0
                ? res1.data
                : res2.data;
        if (p) {
            logger.debug(
                `Post ${fbData.id} (${fbData.text.slice(
                    0,
                    30
                )}...) already exists with _id ${p._id} - postId ${
                    p.postId
                }, skipping...`
            );
            return;
        }
    } catch (err) {
        logger.error(
            `Error while checking if post ${fbData.id} already exists:`
        );
        logger.error((err as AxiosError)?.response?.data || err);
        return;
    }

    logger.warn("Running debug API call for scrapedDataEvent");
    let post: RentalPost;
    try {
        const { data } = await axios.post(config.PARSER_API_BASE_URL, {
            text: fbData.text,
            city
        });
        post = data;
    } catch (err) {
        logger.error("Error while parsing post with id " + fbData.id + ":");
        logger.error((isAxiosError(err) && err.response?.data) || err);
        return;
    }

    // remove all undefined and null fields
    Object.keys(post).forEach(
        key =>
            [null, undefined].includes(post[key as keyof typeof post] as any) &&
            delete post[key as keyof typeof post]
    );

    post.ezaffittoCity = city;

    if (post.address && post.address !== "unknown") {
        try {
            const coords = await Scraper.geolocate(post.address);
            if (coords) {
                post.address = coords.formattedAddress;
                post.latitude = coords.latitude;
                post.longitude = coords.longitude;
            }
        } catch (err) {
            logger.error(
                "Error while geolocating address " +
                    post.address +
                    " for post " +
                    fbData.id +
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
            {
                ...post,
                isForRent:
                    typeof post.isForRent === "boolean" ? post.isForRent : true,
                isRental:
                    typeof post.isRental === "boolean" ? post.isRental : true,
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
        logger.error("Error while saving post with id " + fbData.id + ":");
        logger.error((err as AxiosError)?.response?.data || err);
    }
});

export class Scraper {
    public static async getUrls(city: EzaffittoCity): Promise<string[]> {
        const urls: CityUrls[] = JSON.parse(
            await readFile(config.URLS_JSON_PATH, { encoding: "utf-8" })
        );
        const mapped = urls.find(e => e.city === city)?.urls.map(e => e.url);
        if (!mapped) {
            logger.error("No urls found for city " + city);
            await Scraper.sendPanic("No urls found for city " + city);
            process.exit(1);
        }
        return mapped;
    }

    public static async getCities(): Promise<EzaffittoCity[]> {
        const urls: CityUrls[] = JSON.parse(
            await readFile(config.URLS_JSON_PATH, { encoding: "utf-8" })
        );
        return urls.map(e => e.city);
    }

    private groupQueue: GroupQueue = {
        bologna: [],
        firenze: [],
        milano: [],
        napoli: [],
        roma: [],
        torino: [],
        genova: [],
        padova: []
    };

    private static browser: Browser | null = null;

    public async closeBrowser() {
        await Scraper.browser?.close();
    }

    private startDate: Moment | null = null;
    private endDate: Moment | null = null;

    private urlsNoPostsFetched: string[] = [];

    private setStartEndDate(durationMs: number) {
        this.startDate = moment();
        this.endDate = moment(this.startDate).add(durationMs, "milliseconds");
    }

    public static async geolocate(address: string): Promise<{
        formattedAddress: string;
        latitude: number;
        longitude: number;
    } | null> {
        try {
            const { data } = await axios.get(
                config.DB_API_BASE_URL + "/geolocate/forward",
                { params: { address } }
            );

            return data;
        } catch (err) {
            logger.error("Error while geolocating query");
            logger.error((err as AxiosError).response?.data || err);
            throw new Error("errors.geolocationFailed"); // TODO change with custom error
        }
    }

    private async createRandomQueue(city: EzaffittoCity) {
        // place elements from fbGroupUrls in groupQueue in random order
        const urls = await Scraper.getUrls(city);
        if (urls.length === 0) {
            logger.error("No urls found for city " + city);
            await Scraper.sendPanic("No urls found for city " + city);
            process.exit(1);
        }

        this.groupQueue[city] = urls
            .map(url => ({ url, rand: Math.random() }))
            .sort((a, b) => a.rand - b.rand)
            .map(elem => elem.url);
        logger.debug("Created random queue for city " + city + ": ");
        logger.debug(this.groupQueue[city]);
    }

    private async getGroupUrl(city: EzaffittoCity): Promise<string> {
        if (this.groupQueue[city].length === 0) {
            await this.createRandomQueue(city);
        }
        // string since createRandomQueue() is called before
        // which populates groupQueue with strings
        return this.groupQueue[city].pop() as string;
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
            service: "fb-scraper",
            message
        });
    }

    private async scrape(
        groupUrl: string,
        durationMs: number,
        city: EzaffittoCity
    ) {
        if (!Scraper.browser) {
            logger.info("Browser is null, initializing...");
            await this.init();
        }

        const page = await Scraper.browser?.newPage();

        // const scrapeId = moment().format("YYYY-MM-DD_HH-mm-ss");

        if (!page) {
            logger.error("CRITICAL! Page is null for groupUrl " + groupUrl);
            await Scraper.sendPanic("Page is null for groupUrl " + groupUrl);
            process.exit(1);
        }

        await page.setViewport({ width: 1080, height: 1024 });

        await mkdir(config.SCREENSHOTS_PATH, {
            recursive: true
        });

        this.setStartEndDate(durationMs);

        logger.info(
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

        await this.loadCookies(groupUrl, page);

        await page.setRequestInterception(true);

        const urls: string[] = [];

        page.on("request", async request => {
            try {
                if (request.isInterceptResolutionHandled()) {
                    return;
                }
                if (request.resourceType() === "image") {
                    request.abort();
                    return;
                }
                if (request.url().includes("graphql")) {
                    urls.push(request.url());
                }

                await request.continue();
            } catch (err) {
                logger.error("Error while intercepting request:");
                logger.error(err);
            }
        });

        let fetchedPosts = 0;

        let isError = false;

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

                if (JSON.stringify(arr).includes("Rate limit exceeded")) {
                    logger.error(
                        "Rate limit exceeded for groupUrl " +
                            groupUrl +
                            this.getElapsedStr()
                    );
                    isError = true;
                    await page?.screenshot({
                        path: "screenshots/rate_limit_exceeded.png"
                    });
                    await Scraper.sendPanic(
                        "Rate limit exceeded for groupUrl " + groupUrl
                    );
                    // remove page listeners
                    page.removeAllListeners("request");
                    page.removeAllListeners("response");
                    await page.close();
                    process.exit(1);
                }

                if (isError) {
                    return;
                }

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
                    fetchedPosts++; // ok basta che funziona
                    if (missingProps.length == 0) {
                        // TODO implement save in case of error?

                        scrapedDataEvent.emit("scrapedData", {
                            fbData: props,
                            city
                        });
                        logger.debug(
                            "Emitting new post with id " +
                                props.id +
                                this.getElapsedStr()
                        );
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

        try {
            await page.goto(groupUrl, {
                timeout: 10_000,
                waitUntil: "networkidle2"
            });
            await page.setViewport({ width: 1080, height: 1024 });
        } catch (err) {
            logger.error("Error while going to groupUrl " + groupUrl + ":");
            logger.error(err);
        }

        // screenshot
        try {
            logger.debug(
                "Taking start_page screenshot for groupUrl " + groupUrl
            );
            await page.screenshot({
                path: "screenshots/start_page.png"
            });
        } catch (err) {
            logger.error("Error while taking screenshot:");
            logger.error(err);
        }

        // if div with aria-label="Get started" exists
        // click on it
        try {
            await page.waitForSelector('[aria-label="Get started"]', {
                timeout: 3_000
            });
            await page.click('[aria-label="Get started"]');
            await wait(Math.random() * 1000 + 1000);

            // get span with text "Use for free"
            const [useForFreeSpan] = await page.$x(
                "//span[contains(., 'Use for free')]"
            );
            if (!useForFreeSpan) {
                logger.warn(
                    "useForFreeSpan not found for groupUrl " +
                        groupUrl +
                        this.getElapsedStr()
                );
                throw new Error("useForFreeSpan not found");
            }
            await useForFreeSpan.click();
            await wait(Math.random() * 1000 + 1000);

            // get span with text "Agree"
            const [agreeSpan] = await page.$x("//span[contains(., 'Agree')]");
            if (!agreeSpan) {
                logger.warn(
                    "agreeSpan not found for groupUrl " +
                        groupUrl +
                        this.getElapsedStr()
                );
                throw new Error("agreeSpan not found");
            }
            await agreeSpan.click();

            await page.waitForNavigation({
                waitUntil: "networkidle2",
                timeout: 5_000
            });

            // update cookies file
            await writeFile(
                config.COOKIES_JSON_PATH,
                JSON.stringify(await page.cookies(), null, 4)
            );
        } catch (err) {
            // logger.debug(
            //     "Get started button not found for groupUrl " +
            //         groupUrl +
            //         this.getElapsedStr()
            // );
        }

        // check if requires login

        let loginRequired = false;
        let loginRequiredAgain = false;
        let cantUseFeature = false;
        let passFieldAgain = false;
        const loginText = "You must log in to continue.";
        const cantUseText = "You can't use this feature at the moment";

        try {
            await page.waitForXPath(
                '//*[contains(text(), "' + loginText + '")]',
                { timeout: 3_000 }
            );
            loginRequired = true;
        } catch (err) {
            // login not required
        }

        if (loginRequired) {
            logger.error(
                "Login required for groupUrl " + groupUrl + this.getElapsedStr()
            );
            try {
                // save html to screenshots
                const html = await page.content();
                await writeFile(
                    path.join(config.SCREENSHOTS_PATH, "login_required.html"),
                    html
                );
                await page.screenshot({
                    path: "screenshots" + "/login_required.png"
                });

                // try to login: write email on input .inputtext with id email
                // check if email is already written
                const emailInput = await page.$("#email");
                if (!emailInput) {
                    logger.error(
                        "emailInput not found for groupUrl " +
                            groupUrl +
                            this.getElapsedStr()
                    );
                    throw new Error("emailInput not found");
                }
                // check if email already written
                const emailInputValue = await page.evaluate(
                    (input: any) => input.value,
                    emailInput
                );
                if (emailInputValue !== "") {
                    // clear input
                    await page.click("#email");
                    await page.keyboard.down("Control");
                    await page.keyboard.press("A");
                    await page.keyboard.up("Control");
                    await page.keyboard.press("Backspace");
                }
                await page.type("#email", envs.FB_ACCOUNT_EMAIL, {
                    delay: Math.random() * 100 + 50
                });
                await page.type("#pass", envs.FB_ACCOUNT_PASSWORD, {
                    delay: Math.random() * 100 + 50
                });
                await wait(Math.random() * 1000 + 500);
                logger.info(
                    "Trying to login with email " +
                        envs.FB_ACCOUNT_EMAIL +
                        "..." +
                        this.getElapsedStr()
                );
                await page.screenshot({
                    path: "screenshots" + "/before_login_try.png"
                });
                await page.click("#loginbutton");
                await wait(Math.random() * 1000 + 500);
                await page.screenshot({
                    path: "screenshots" + "/before_login_try_clicked.png"
                });
            } catch (err) {}

            try {
                // just to be sure
                await page.waitForNavigation({
                    waitUntil: "networkidle2",
                    timeout: 2_000
                });
            } catch (err) {}

            let passFieldPresent = false;
            try {
                // check if pass field is still present
                await page.waitForSelector("#pass", {
                    timeout: 3_000
                });
                passFieldPresent = true;
            } catch (err) {}

            if (passFieldPresent) {
                await page.screenshot({
                    path: "screenshots" + "/passfield_present.png"
                });
            } else {
                await page.screenshot({
                    path: "screenshots" + "/passfield_not_present.png"
                });
                await writeFile(
                    config.NEW_COOKIES_JSON_PATH,
                    JSON.stringify(await page.cookies(), null, 4)
                );
                logger.info(
                    "Saved new cookies file for groupUrl " +
                        groupUrl +
                        this.getElapsedStr()
                );
            }

            try {
                // just to be sure
                await page.waitForNavigation({
                    waitUntil: "networkidle2",
                    timeout: 1_000
                });
            } catch (err) {}

            try {
                // exit if still requires login
                await page.waitForXPath(
                    '//*[contains(text(), "' + loginText + '")]',
                    { timeout: 2_000 }
                );
                loginRequiredAgain = true;
            } catch (err) {
                // login not required
            }

            try {
                // check if can't use feature
                await page.waitForXPath(
                    '//*[contains(text(), "' + cantUseText + '")]',
                    { timeout: 1_000 }
                );
                cantUseFeature = true;
            } catch (err) {}

            try {
                // check if pass field is still present
                await page.waitForSelector("#pass", {
                    timeout: 1_000
                });
                passFieldAgain = true;
            } catch (err) {}
        }

        if (loginRequiredAgain || cantUseFeature || passFieldAgain) {
            await page.screenshot({
                path: "screenshots" + "/login_failed.png"
            });

            logger.error(
                "Login required for groupUrl " +
                    groupUrl +
                    " - login with email " +
                    envs.FB_ACCOUNT_EMAIL +
                    " failed: " +
                    loginRequiredAgain +
                    " - cantUseFeature: " +
                    cantUseFeature +
                    " - passFieldAgain: " +
                    passFieldAgain +
                    this.getElapsedStr()
            );
            await Scraper.sendPanic(
                `Login required for groupUrl ${groupUrl} - login with email ${envs.FB_ACCOUNT_EMAIL} failed: ${loginRequiredAgain} - cantUseFeature: ${cantUseFeature} - passFieldAgain: ${passFieldAgain} - exiting`
            );
            // remove page listeners
            page.removeAllListeners("request");
            page.removeAllListeners("response");
            await page.close();
            process.exit(1);
        }

        // click refuse cookie button by selecting aria-label
        const cookieButtonSelector =
            '[aria-label="Rifiuta cookie facoltativi"]';
        ('[aria-cookiebanner="accept_only_essential_button"]');

        // if (page.$(cookieButtonSelector) == null)
        try {
            await page.waitForSelector(cookieButtonSelector, {
                timeout: 1_000
            });
            await wait(Math.random() * 1000);
            await page.click(cookieButtonSelector);
        } catch (err) {
            // logger.debug(
            //     "Cookie button not found for groupUrl " +
            //         groupUrl +
            //         this.getElapsedStr()
            // );
        }

        // click close login button by selecting aria-label
        const closeLoginButtonSelector = '[aria-label="Chiudi"]';

        // if (page.$(closeLoginButtonSelector) == null)
        try {
            await page.waitForSelector(closeLoginButtonSelector, {
                timeout: 1_000
            });
            await wait(Math.random() * 1000);
            await page.click(closeLoginButtonSelector);
        } catch (err) {
            // logger.debug(
            //     "Close login button not found for groupUrl " +
            //         groupUrl +
            //         this.getElapsedStr()
            // );
        }

        try {
            const [orderBySpan] = await page.$x(
                "//span[contains(., 'Più pertinenti')]"
            );
            if (!orderBySpan) {
                logger.debug(
                    "orderBySpan not found for groupUrl " +
                        groupUrl +
                        this.getElapsedStr()
                );
            } else {
                await orderBySpan.click();
                const [newPostsSpan] = await page.$x(
                    "//span[contains(., 'Nuovi post')]"
                );
                if (!newPostsSpan) {
                    logger.debug(
                        "newPostsSpan not found for groupUrl " +
                            groupUrl +
                            this.getElapsedStr()
                    );
                } else {
                    await newPostsSpan.click();
                    logger.debug(
                        "Sorting by new posts for groupUrl " +
                            groupUrl +
                            this.getElapsedStr()
                    );
                }
            }
        } catch (err) {
            logger.error("Error while sorting by new posts:");
            logger.error(err);
        }

        this.setStartEndDate(durationMs);

        // DEBUG SCREENSHOT
        // await page.screenshot({
        //     path: "screenshots/" + scrapeId + "/sorted_by_new.png"
        // });

        while (moment().isBefore(this.endDate)) {
            try {
                await wait(Math.random() * 500 + 500);
                // await page.keyboard.press("PageDown");
                await page.mouse.wheel({
                    deltaY: Math.floor(Math.random() * 500) + 500
                });
                await wait(Math.random() * 500 + 500);
            } catch (err) {
                logger.error("Error while scrolling:");
                logger.error(err);
            }
        }

        if (fetchedPosts == 0) {
            logger.warn(
                "No posts fetched for groupUrl " +
                    groupUrl +
                    this.getElapsedStr()
            );
            this.urlsNoPostsFetched.push(groupUrl);
        } else {
            this.urlsNoPostsFetched = [];
            // update cookies file
            await writeFile(
                config.COOKIES_JSON_PATH,
                JSON.stringify(await page.cookies(), null, 4)
            );
            logger.debug(
                "Updated cookies file for groupUrl " +
                    groupUrl +
                    this.getElapsedStr()
            );
        }

        try {
            await page.screenshot({
                path:
                    "screenshots/" +
                    (fetchedPosts === 0
                        ? "/no_posts_fetched.png"
                        : "/end_page.png")
            });
        } catch (err) {
            logger.error("Error while taking screenshot:");
            logger.error(err);
        }

        logger.info(
            "Scrape finished for groupUrl " +
                groupUrl +
                ", scraped posts: " +
                fetchedPosts +
                this.getElapsedStr()
        );

        // remove page listeners
        page.removeAllListeners("request");
        page.removeAllListeners("response");

        this.startDate = null;
        this.endDate = null;

        await page.close();
    }

    private async loadCookies(groupUrl: string, page: Page) {
        let cookies: Cookie[];

        if (existsSync(config.NEW_COOKIES_JSON_PATH)) {
            logger.info(
                "New cookies file found, using it for groupUrl " +
                    groupUrl +
                    this.getElapsedStr()
            );
            cookies = require(config.NEW_COOKIES_JSON_PATH);
            try {
                await unlink(config.NEW_COOKIES_JSON_PATH);
            } catch (err) {
                logger.error(
                    "Error while deleting new cookies file for groupUrl " +
                        groupUrl +
                        ":"
                );
                logger.error(err);
            }
        } else if (existsSync(config.COOKIES_JSON_PATH)) {
            logger.debug(
                "New cookies file not found, using old one for groupUrl " +
                    groupUrl +
                    this.getElapsedStr()
            );
            cookies = require(config.COOKIES_JSON_PATH);
        } else {
            logger.error(
                "No cookies file found for groupUrl " +
                    groupUrl +
                    this.getElapsedStr()
            );
            await Scraper.sendPanic(
                "No cookies file found for groupUrl " + groupUrl
            );
            // remove page listeners
            page.removeAllListeners("request");
            page.removeAllListeners("response");
            await page.close();
            process.exit(1);
        }

        try {
            await page.setCookie(...mapCookiesToPuppeteer(cookies));
        } catch (err) {
            logger.error("CRITICAL: Error while setting cookies:");
            logger.error(err);
        }
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

            for (const city of await Scraper.getCities()) {
                logger.info(
                    `Scraping for ${(duration / 1000).toFixed(
                        3
                    )} seconds city ${city}...`
                );

                const groupUrl = await this.getGroupUrl(city);

                try {
                    await this.scrape(groupUrl, duration, city);
                    if (
                        this.urlsNoPostsFetched.length >=
                        config.MAX_TIMES_NO_POSTS_FETCHED
                    ) {
                        logger.error(
                            "No posts fetched 3 times in a row, sending panic message..."
                        );
                        await Scraper.sendPanic(
                            `No posts fetched ${
                                config.MAX_TIMES_NO_POSTS_FETCHED
                            } times in a row for groups: ${this.urlsNoPostsFetched.join(
                                ", "
                            )} - exiting`
                        );
                        process.exit(1);
                    }
                } catch (err) {
                    logger.error("Error while scraping:");
                    logger.error(err);
                }
                await wait(Math.floor(Math.random() * 5000));
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
