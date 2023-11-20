import axios, { AxiosError, isAxiosError } from "axios";
import { CronJob } from "cron";
import {
    CityUrls,
    EzaffittoCity,
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
import { readFile } from "fs/promises";

import "./healthcheckPing";

export class Scraper {
    private static async getUrl(
        city: EzaffittoCity,
        type: ScrapeType
    ): Promise<string | null> {
        const urls: CityUrls[] = JSON.parse(
            await readFile(config.URLS_JSON_PATH, { encoding: "utf-8" })
        );
        return (
            urls.find(e => e.city === city)?.urls.find(e => e.type === type)
                ?.url || null
        );
    }

    private static async getBannedAgencyIds(): Promise<string[]> {
        const urls: CityUrls[] = JSON.parse(
            await readFile(config.URLS_JSON_PATH, { encoding: "utf-8" })
        );
        return urls
            .map(e => e.bannedAgencyIds || [])
            .reduce((acc, curr) => [...acc, ...curr], []);
    }

    public static async getCities(): Promise<EzaffittoCity[]> {
        const urls: CityUrls[] = JSON.parse(
            await readFile(config.URLS_JSON_PATH, { encoding: "utf-8" })
        );
        return urls.map(e => e.city);
    }

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

    public async scrape(
        city: EzaffittoCity,
        type: ScrapeType
    ): Promise<RentalPost[]> {
        try {
            const url = await Scraper.getUrl(city, type);
            if (!url) {
                logger.error(
                    "Scrape invalid URL! City: " + city + ", type: " + type
                );
                throw new Error("Error while determining URL");
            }

            const bannedAgencyIds = await Scraper.getBannedAgencyIds();

            const res = await axios.get(url);
            const data = res.data as Root;
            const filtered = data.ads.filter(
                e =>
                    !e.advertiser.company &&
                    !bannedAgencyIds.includes(e.advertiser.user_id)
            );
            logger.debug(`Fetched ${filtered.length} posts`);
            return filtered.map(e => {
                const features = e.features.map(e =>
                    this.mapFeatureToKey(e, type)
                );

                const post: RentalPost = {
                    postId: e.urn.split("ad:")[1]?.split(":")[0] || e.urn,
                    ezaffittoCity: city,
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
                    description: e.subject + "\n" + e.body,
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

        for (const city of await Scraper.getCities()) {
            let scraped;
            try {
                scraped = await scraper.scrape(city, lastScrapeType);
            } catch (err) {
                logger.error("Error in scraping");
                logger.error(err);
                return;
            }

            logger.info(`Scraped ${scraped.length} posts`);

            for (let i = 0; i < scraped.length; i++) {
                const post = scraped[i];

                // check if already exists in order to not
                // run geolocation on already existing posts
                try {
                    const res1 = await axios.post(
                        config.DB_API_BASE_URL + "/rentalpost/text",
                        { text: post.description, source: "subito" }
                    );
                    const res2 = await axios.get(
                        config.DB_API_BASE_URL +
                            "/rentalpost/postid/" +
                            post.postId
                    );
                    const p =
                        res1.data &&
                        typeof res1.data === "object" &&
                        Object.keys(res1.data).length > 0
                            ? res1.data
                            : res2.data;
                    if (p) {
                        logger.debug(
                            `Post ${post.postId} (${
                                post.description?.slice(0, 30) ||
                                "(no description)"
                            }...) already exists with _id ${p._id} - postId ${
                                p.postId
                            }, skipping...`
                        );
                        scraped.splice(i, 1);
                        i--;
                    } else {
                        logger.debug(
                            `Post ${post.postId} (${
                                post.description?.slice(0, 30) ||
                                "(no description)"
                            }...) does not exist, continuing...`
                        );
                    }
                } catch (err) {
                    logger.error(
                        `Error while checking if post ${post.postId} already exists:`
                    );
                    logger.error((err as AxiosError)?.response?.data || err);
                    return;
                }
            }

            // geolocate
            for (const post of scraped) {
                if (
                    typeof post.latitude !== "number" ||
                    typeof post.longitude !== "number" ||
                    typeof post.address === "string"
                ) {
                    logger.debug(
                        `Skipping post ${
                            post.postId
                        } (${post.description?.slice(
                            0,
                            30
                        )}...) because already has address or no coordinates`
                    );
                    continue;
                }
                try {
                    logger.debug(
                        `Geolocating post ${
                            post.postId
                        } (${post.description?.slice(0, 30)}...)`
                    );
                    const geolocated = await Scraper.reverseGeolocate(
                        post.latitude,
                        post.longitude
                    );
                    if (geolocated) {
                        post.address = geolocated.formattedAddress;
                    }
                    logger.debug(
                        `Geolocated post ${
                            post.postId
                        } (${post.description?.slice(0, 30)}...) to ${
                            post.address
                        }`
                    );
                } catch (err) {
                    logger.error("Error in reverse geolocation");
                    logger.error(err);
                }
            }

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
                    logger.error(
                        (isAxiosError(err) && err.response?.data) || err
                    );
                }
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
