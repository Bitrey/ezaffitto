import puppeteer from "puppeteer-core";
import { ScrapedDataEventEmitter } from "./interfaces/events";
import EventEmitter from "events";
import { logger } from "./shared/logger";
import { wait } from "./shared/wait";
import { config } from "./config/config";
import { FbPost } from "./interfaces/FbPost";
import { extractor } from "./extractor";
import { runProducer } from "./producer";
import moment from "moment";

export const scrapedDataEvent: ScrapedDataEventEmitter = new EventEmitter();

const fbGroupUrls = [
    "https://www.facebook.com/groups/AffittoBologna/?locale=it_IT",
    "https://www.facebook.com/groups/bolognaaffitti/?locale=it_IT",
    "https://www.facebook.com/groups/affitti.a.bologna/?locale=it_IT",
    "https://www.facebook.com/groups/affittobolonga/",
    "https://www.facebook.com/groups/4227281414051454/",
    "https://www.facebook.com/groups/488856121488809/?locale=it_IT"
    // "https://www.facebook.com/groups/114050352266007/", // privato
    // "https://www.facebook.com/groups/172693152831725/", // privato, enorme
];

async function scrape(groupUrl: string, durationMs: number) {
    const startDate = moment();

    if (config.DEBUG_WAIT_MS) {
        await wait(config.DEBUG_WAIT_MS);
    }

    logger.debug(
        `Starting scrape for groupUrl ${groupUrl} for ${(
            durationMs / 1000
        ).toFixed(3)}s`
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

    logger.debug("Browser connected");

    const page = await browser.newPage();

    await page.setRequestInterception(true);

    const urls: string[] = [];

    page.on("request", interceptedRequest => {
        if (interceptedRequest.isInterceptResolutionHandled()) return;
        if (interceptedRequest.url().includes("graphql")) {
            urls.push(interceptedRequest.url());
        }

        interceptedRequest.continue();
    });

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
                    logger.debug(`Emitting new post with id ${props.id}`);
                } else {
                    logger.debug(`Missing props: ${missingProps.join(", ")}`);
                }
            }
        }
    });

    await page.goto(groupUrl);

    await page.setViewport({ width: 1080, height: 1024 });

    // click refuse cookie button by selecting aria-label
    const cookieButtonSelector = '[aria-label="Rifiuta cookie facoltativi"]';

    await page.waitForSelector(cookieButtonSelector);
    await wait(Math.random() * 1000);
    await page.click(cookieButtonSelector);

    // click close login button by selecting aria-label
    const closeLoginButtonSelector = '[aria-label="Chiudi"]';

    await page.waitForSelector(closeLoginButtonSelector);
    await wait(Math.random() * 1000);
    // await page.click(closeLoginButtonSelector);

    const emailSelector = 'input[name="email"]';
    const passSelector = 'input[name="pass"]';

    await page.waitForSelector(emailSelector);
    await wait(Math.random() * 1000);
    await page.type(emailSelector, "prova.provone@proton.me", {
        delay: Math.floor(Math.random() * 100) + 50
    });
    await wait(Math.random() * 1000);
    await page.type(passSelector, "CiaoProvaProvone!", {
        delay: Math.floor(Math.random() * 100) + 50
    });
    await wait(Math.random() * 1000);
    await page.keyboard.press("Enter");

    logger.debug("Logged in");

    // let closedTimes = 0;

    while (moment().isBefore(startDate.add(durationMs, "ms"))) {
        // const elem = await page.$(closeLoginButtonSelector);
        // if (elem !== null) {
        //     closedTimes++;
        //     if (closedTimes === config.WARN_CLOSED_TIMES) {
        //         logger.warn(`Closed login popup ${closedTimes} times`);
        //     }
        //     await wait(Math.random() * 1000);
        //     await page.click(closeLoginButtonSelector);
        // }
        await wait(Math.random() * 500 + 500);
        await page.mouse.wheel({
            deltaY: Math.floor(Math.random() * 500) + 500
        });
        await wait(Math.random() * 500 + 500);

        // await page.keyboard.press("PageDown");
    }

    await browser.close();
    logger.info("Scrape finished");
}

const runScraper = async () => {
    logger.info("Starting scraper...");
    await runProducer();

    logger.info("Starting scraping loop...");
    while (true) {
        const duration = config.GET_DELAY_BETWEEN_SCRAPES_MS();

        logger.info(`Scraping for ${duration / 1000} seconds...`);

        for (const groupUrl of fbGroupUrls) {
            try {
                await scrape(groupUrl, duration);
            } catch (err) {
                logger.error(err);
            }
            // wait for duration + random time between 0 and 5 seconds
            await wait(duration + Math.floor(Math.random() * 5000));
        }
    }
};

runScraper();
