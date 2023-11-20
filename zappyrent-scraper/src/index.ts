// https://bologna.bakeca.it/annunci/offro-camera/page/2/

import moment from "moment";
import { CronJob } from "cron";
import axios, { isAxiosError } from "axios";
import {
    CityUrls,
    EzaffittoCity,
    RentalPost,
    RentalTypes
} from "./interfaces/shared";
import { ZappyRentRoot } from "./interfaces/zappyrent";
import { logger } from "./shared/logger";
import { config } from "./config";

import "./healthcheckPing";
import { readFile } from "fs/promises";

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

    private mapRentalType(rawType: string): RentalTypes {
        // currently known values are just "Entire Property" and "Studio"
        switch (rawType) {
            case "Entire Property":
                return RentalTypes.APARTMENT;
            case "Studio":
                return RentalTypes.STUDIO;
            case "Private Room":
                return RentalTypes.SINGLE_ROOM;
            case "Shared Room":
                return RentalTypes.DOUBLE_ROOM;
            default:
                logger.warn(`Unknown rental type: ${rawType}`);
                return RentalTypes.OTHER;
        }
    }

    public async scrape(
        url: string,
        city: EzaffittoCity
    ): Promise<RentalPost[]> {
        const res = await axios.post(url, {
            city, // bologna va bene, gli altri in teoria idem
            types: [
                "studio",
                "entire-property-2-rooms",
                "entire-property-3-rooms",
                "entire-property-4-rooms",
                "private-room",
                "shared-room"
            ],
            f_params: { orderBy: { field: "new_listing", type: "DESC" } }
        });
        const data = res.data as ZappyRentRoot;

        if (data.error) {
            logger.error(data.message);
            throw new Error(data.message);
        }

        logger.debug(`Found ${data.data.properties.length} properties`);

        return data.data.properties.map(e => {
            const obj: RentalPost = {
                postId: e.id.toString(),
                rawData: e,
                ezaffittoCity: city,
                isRental: true,
                isForRent: true,
                source: "zappyrent",
                floorNumber: Number.isNaN(parseInt(e.floor))
                    ? undefined
                    : parseInt(e.floor),
                areaSqMeters:
                    !e.size || Number.isNaN(parseInt(e.size))
                        ? undefined
                        : parseInt(e.size),
                monthlyPrice: e.price,
                images:
                    e.images?.map(i => "https://www.zappyrent.com" + i.url) ||
                    [],
                url: `https://www.zappyrent.com/it/affitto/${(
                    e.street +
                    " " +
                    e.city
                )
                    .toLowerCase()
                    .replace(/ /g, "-")}-id-${e.id}`,
                address: `${e.street} ${e.street_number}, ${e.cap} ${e.city}`,
                latitude: parseFloat(e.latitude) || undefined,
                longitude: parseFloat(e.longitude) || undefined,
                rentalType: this.mapRentalType(e.type),
                hasAirConditioning: e.furniture.includes("air"),
                hasElevator: e.services.includes("elevator"),
                // date: moment(
                //     e.firstAvailablePeriods.start_date,
                //     "YYYY-MM-DD"
                // ).toDate(),
                date: moment(e.updated_at).toDate(),
                smokingAllowed: e.smoking == null ? undefined : !!e.smoking,
                availabilityStartDate: e.firstAvailablePeriods.start_date
                    ? moment(
                          e.firstAvailablePeriods.start_date,
                          "YYYY-MM-DD"
                      ).toDate()
                    : undefined,
                availabilityEndDate: e.firstAvailablePeriods.start_date
                    ? moment(
                          e.firstAvailablePeriods.end_date,
                          "YYYY-MM-DD"
                      ).toDate()
                    : undefined
            };

            // remove undefined entries
            Object.keys(obj).forEach(
                key =>
                    obj[key as keyof typeof obj] === undefined &&
                    delete obj[key as keyof typeof obj]
            );

            return obj;
        });
    }
}
const job = new CronJob(
    config.RUN_SCRAPER_CRON,
    async function () {
        if (!config.DEBUG_RUN_SCRAPER) {
            logger.warn(
                "Not running scraper because DEBUG_RUN_SCRAPER is false"
            );
        }

        const scraper = new Scraper();

        for (const city of await Scraper.getCities()) {
            logger.info("Running ZappyRent scraper for city " + city);

            const url = await Scraper.getUrl(city);
            if (!url) {
                logger.error("No url found for city " + city);
                throw new Error("No url found for city " + city);
            }

            let scraped;
            try {
                scraped = await scraper.scrape(url, city);
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
                        `Sent postId ${post.postId}->${data.postId} (${post.address}) to db-api - got _id ${data._id}`
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
    logger.info(
        "ZappyRent scraper started with cron " + config.RUN_SCRAPER_CRON
    );
}

run();
