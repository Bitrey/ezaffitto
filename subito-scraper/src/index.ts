import axios, { isAxiosError } from "axios";
import { CronJob } from "cron";
import {
    Feature,
    RentalPost,
    RentalTypes,
    Root,
    ScrapeType,
    SexRestrictions
} from "./interfaces";
import { logger } from "./shared/logger";
import { config } from "./config";
import moment from "moment-timezone";

import "./healthcheckPing";

export class Scraper {
    private static readonly apartmentsUrl =
        "https://www.subito.it/hades/v1/search/items?c=7&r=8&ci=1&to=037006&t=u&qso=false&shp=false&urg=false&sort=datedesc&lim=30&start=0&advt=0";
    private static readonly roomsUrl =
        "https://www.subito.it/hades/v1/search/items?c=43&r=8&ci=1&to=037006&t=u&qso=false&shp=false&urg=false&sort=datedesc&lim=30&start=0";

    // TODO! specifica che provi ad eliminare agenzie private stupide
    private static readonly bannedAgencyIds: string[] = [
        "101628895", // trova affitto
        "105809558" // affitto privato
    ];

    private mapFeatureToKey(
        feature: Feature,
        scrapeType: ScrapeType
    ): Partial<RentalPost> {
        switch (feature.uri) {
            case "/bathrooms":
                return {
                    bathrooms: Number(feature.values[0]?.key) || undefined
                };
            case "/furnished":
                return { furnished: feature.values[0]?.key === "1" };
            case "/room_type":
                return {
                    rentalType: (feature.values[0]?.key === "1"
                        ? "singleRoom"
                        : feature.values[0]?.key === "2"
                        ? "doubleRoom"
                        : scrapeType === ScrapeType.APARTMENTS
                        ? "apartment"
                        : "other") as RentalTypes
                };
            case "/price":
                return {
                    monthlyPrice: Number(feature.values[0]?.key) || undefined
                };
            case "/air_conditioning":
                return { hasAirConditioning: feature.values[0]?.key === "1" };
            case "/parking":
                return {
                    hasParking: feature.values.some(e =>
                        e.value.includes("auto")
                    )
                };
            case "/elevator":
                return { hasElevator: feature.values[0]?.key === "1" };
            case "/floor":
                return {
                    floorNumber: Number(feature.values[0]?.key) || undefined
                };
            case "/balcony":
                return { hasBalcony: feature.values[0]?.key === "1" };
            case "/gender":
                return {
                    sexRestrictions: (feature.values[0].key === "1"
                        ? "males"
                        : feature.values[0].key === "2"
                        ? "females"
                        : "everyone") as SexRestrictions
                };
            case "/smoker":
                return {
                    smokingAllowed:
                        feature.values[0]?.key === "1"
                            ? true
                            : feature.values[0]?.key === "2"
                            ? false
                            : undefined
                };
            case "/heating":
                return {
                    hasHeating:
                        Number(feature.values[0]?.key) &&
                        Number(feature.values[0].key) > 0
                            ? true
                            : false
                };

            default:
                // logger.debug(`Unknown feature ${feature.uri}`);
                return {};
        }
    }

    public async scrape(type: ScrapeType): Promise<RentalPost[]> {
        try {
            const res = await axios.get(
                type === ScrapeType.APARTMENTS
                    ? Scraper.apartmentsUrl
                    : Scraper.roomsUrl
            );
            const data = res.data as Root;
            const filtered = data.ads.filter(
                e =>
                    !e.advertiser.company &&
                    !Scraper.bannedAgencyIds.includes(e.advertiser.user_id)
            );
            return filtered.map(e => {
                const features = e.features.map(e =>
                    this.mapFeatureToKey(e, type)
                );

                const post: RentalPost = {
                    postId: e.urn.split("ad:")[1]?.split(":")[0] || e.urn,
                    source: "subito",
                    rawData: e,
                    isRental: true,
                    isForRent: true,
                    images: e.images
                        .map(e => e.scale.find(f => f.size === "big")?.uri)
                        .filter(e => e) as string[],
                    date: moment
                        .tz(
                            e.dates.display,
                            "YYYY-MM-DD HH:mm:ss",
                            "Europe/Rome"
                        )
                        .toDate(),
                    url: e.urls.default,
                    authorUserId: e.advertiser.user_id,
                    authorUsername: e.advertiser.name,
                    description: e.body,
                    latitude: Number(e.geo?.map?.latitude) || undefined,
                    longitude: Number(e.geo?.map?.longitude) || undefined,
                    rentalType: features.find(e => e.rentalType)?.rentalType,
                    ...features.reduce((acc, curr) => ({ ...acc, ...curr }), {})
                };

                return post;
            });
        } catch (err) {
            if (isAxiosError(err)) {
                logger.error("Error in axios request");
                throw new Error(err.response?.data || err.message);
            }
            logger.error("Error in scraping");
            throw err;
        }
    }
}

let lastScrapeType = ScrapeType.APARTMENTS;

const job = new CronJob(
    config.RUN_SCRAPER_CRON,
    async function () {
        if (!config.DEBUG_RUN_SCRAPER) {
            logger.warn(
                "Not running scraper because DEBUG_RUN_SCRAPER is false"
            );
        }

        const scraper = new Scraper();

        lastScrapeType =
            lastScrapeType === ScrapeType.APARTMENTS
                ? ScrapeType.ROOMS
                : ScrapeType.APARTMENTS;

        logger.info(
            "Running Subito scraper for type " +
                (lastScrapeType === ScrapeType.APARTMENTS
                    ? "apartments"
                    : "rooms")
        );

        let scraped;
        try {
            scraped = await scraper.scrape(lastScrapeType);
        } catch (err) {
            logger.error("Error in scraping");
            logger.error(err);
            return;
        }

        logger.info(`Scraped ${scraped.length} posts`);

        logger.warn("Sending data to db-api");
        for (const post of scraped) {
            try {
                // TODO replace with RabbitMQ
                const { data } = await axios.post(
                    config.DB_API_BASE_URL + "/rentalpost",
                    post
                );
                logger.info(
                    `Sent postId ${data.postId} (${post.description?.slice(
                        0,
                        30
                    )}...) to db-api - _id ${data._id}`
                );
            } catch (err) {
                logger.error("Error in sending data to db-api");
                logger.error((isAxiosError(err) && err.response?.data) || err);
            }
        }
    },
    null,
    false,
    "Europe/Rome"
);

async function run() {
    job.start();
    logger.info("Subito scraper started with cron " + config.RUN_SCRAPER_CRON);
}

run();
