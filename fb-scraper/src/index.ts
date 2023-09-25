import puppeteer, { Protocol } from "puppeteer-core";
import { ScrapedDataEventEmitter } from "./interfaces/events";
import EventEmitter from "events";
import { logger } from "./shared/logger";
import { wait } from "./shared/wait";
import { config } from "./config/config";
import { FbPost } from "./interfaces/FbPost";
import { extractor } from "./extractor";
import { runProducer } from "./producer";
import moment, { Moment } from "moment";

export const scrapedDataEvent: ScrapedDataEventEmitter = new EventEmitter();

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
    private startDate: Moment | null = null;
    private endDate: Moment | null = null;

    private setStartEndDate(durationMs: number) {
        this.startDate = moment();
        this.endDate = moment(this.startDate).add(durationMs, "milliseconds");
    }

    private async scrape(groupUrl: string, durationMs: number) {
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

        if (config.DEBUG_WAIT_MS) {
            await wait(config.DEBUG_WAIT_MS);
        }

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

        await page.goto(groupUrl);
        await page.setViewport({ width: 1080, height: 1024 });

        // check config.GET_COOKIE_CACHE_DURATION_MINUTES
        if (!hasLoginCookies) {
            logger.debug(
                "Getting new cookies for groupUrl " +
                    groupUrl +
                    this.getElapsedStr()
            );

            // click refuse cookie button by selecting aria-label
            const cookieButtonSelector =
                '[aria-label="Rifiuta cookie facoltativi"]';

            try {
                await page.waitForSelector(cookieButtonSelector, {
                    timeout: 10000
                });
            } catch (err) {
                logger.warn(
                    "Error while trying to refuse cookie button (already refused?)" +
                        this.getElapsedStr()
                );
            }

            await wait(Math.random() * 1000);
            await page.click(cookieButtonSelector);

            // click close login button by selecting aria-label
            const closeLoginButtonSelector = '[aria-label="Chiudi"]';

            try {
                await page.waitForSelector(closeLoginButtonSelector, {
                    timeout: 10000
                });
            } catch (err) {
                logger.warn(
                    "Error while trying to close login button (already logged in?)" +
                        this.getElapsedStr()
                );

                // print html of element data-pagelet="DiscussionRootSuccess"
                const contentSelector =
                    '[data-pagelet="DiscussionRootSuccess"]';
                const contentElem = await page.$(contentSelector);
                if (!contentElem) {
                    logger.warn("No contentElem found" + this.getElapsedStr());
                } else {
                    const contentHtml = await page.evaluate(
                        contentElem => contentElem.innerHTML,
                        contentElem
                    );
                    logger.warn(
                        "contentHtml: " + contentHtml + this.getElapsedStr()
                    );
                }
            }

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

            try {
                await page.waitForNavigation({ timeout: 10000 });

                this.cookiesCache = await page.cookies();
                this.cookiesCacheDate = moment();

                logger.debug(
                    "Logged in for groupUrl " + groupUrl + this.getElapsedStr()
                );
            } catch (err) {
                logger.warn(
                    "Error while trying to login (already logged in?)" +
                        this.getElapsedStr()
                );

                // print html of element data-pagelet="DiscussionRootSuccess"
                const contentSelector =
                    '[data-pagelet="DiscussionRootSuccess"]';
                const contentElem = await page.$(contentSelector);
                if (!contentElem) {
                    logger.warn("No contentElem found" + this.getElapsedStr());
                } else {
                    const contentHtml = await page.evaluate(
                        contentElem => contentElem.innerHTML,
                        contentElem
                    );
                    logger.warn(
                        "contentHtml: " + contentHtml + this.getElapsedStr()
                    );
                }
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

        console.log(
            "Just logged in: resetting startDate" + this.getElapsedStr()
        );
        this.setStartEndDate(durationMs);

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
        await runProducer();

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
