// https://bologna.bakeca.it/annunci/offro-camera/page/2/

import {
    CityUrlObj,
    CityUrls,
    EzaffittoCity,
    RentalPost,
    RentalTypes
} from "./interfaces/shared";
import axios, { isAxiosError } from "axios";
import { ImmobiliareRoot, Property } from "./interfaces/immobiliare";
import { logger } from "./shared/logger";
import { CronJob } from "cron";
import { config } from "./config";
import "./healthcheckPing";
import { readFile } from "fs/promises";

export class Scraper {
    public static async getMeta(city: EzaffittoCity): Promise<CityUrls | null> {
        const urls: CityUrls[] = JSON.parse(
            await readFile(config.URLS_JSON_PATH, { encoding: "utf-8" })
        );
        return urls.find(e => e.city === city) || null;
    }

    public static async getCities(): Promise<EzaffittoCity[]> {
        const urls: CityUrls[] = JSON.parse(
            await readFile(config.URLS_JSON_PATH, { encoding: "utf-8" })
        );
        return urls.map(e => e.city);
    }

    private static async getBannedAgencyIds(): Promise<number[]> {
        const urls: CityUrls[] = JSON.parse(
            await readFile(config.URLS_JSON_PATH, { encoding: "utf-8" })
        );
        return urls
            .map(e => e.bannedAgencyIds || [])
            .reduce((acc, curr) => [...acc, ...curr], []);
    }

    public async scrape(city: EzaffittoCity): Promise<RentalPost[]> {
        const meta = await Scraper.getMeta(city);
        if (!meta || !meta.urls[0]) {
            logger.error(`No meta found for city ${city}`);
            throw new Error(`No meta found for city ${city}`);
        }

        const { fkRegione, idComune, idNazione, idProvincia, path, url } =
            meta.urls[0];

        let res;
        try {
            res = await axios.get(url, {
                params: {
                    fkRegione,
                    criterio: "dataModifica",
                    idCategoria: "4",
                    idComune,
                    idContratto: "2",
                    idNazione,
                    idProvincia,
                    ordine: "desc",
                    paramsCount: "1",
                    path,
                    __lang: "it"
                }
            });
        } catch (err) {
            if (isAxiosError(err)) {
                logger.error("Error in axios request");
                throw new Error(err.response?.data || err.message);
            }
            logger.error("Error in scraping");
            throw err;
        }

        const data = res.data as ImmobiliareRoot;

        logger.debug(
            `Found ${data.results.length} (count: ${data.count}) properties`
        );

        const bannedAgencies = await Scraper.getBannedAgencyIds();

        const posts: RentalPost[] = data.results
            .filter(
                e =>
                    !e.realEstate.advertiser.agency?.id ||
                    !bannedAgencies.includes(e.realEstate.advertiser.agency.id)
            )
            .map(e => {
                const prop = e.realEstate.properties[0] as Property | undefined;

                const obj: RentalPost = {
                    postId: e.realEstate.id.toString(),
                    rawData: e,
                    ezaffittoCity: city,
                    isRental: true,
                    isForRent: true,
                    source: "immobiliare",
                    // e.realEstate.properties ha sempre length === 1 (da quel che ho notato), dunque uso [0] supponendolo vero
                    floorNumber: prop
                        ? parseInt(prop?.floor?.ga4FloorValue)
                        : undefined,
                    areaSqMeters:
                        (prop && parseInt(prop?.surface?.replace(" m²", ""))) ||
                        undefined,

                    monthlyPrice: e.realEstate.price.value,

                    description: prop?.description,

                    images: prop
                        ? prop.multimedia.photos.map(f =>
                              f.urls.small.replace("xxs-c.jpg", "xxl.jpg")
                          )
                        : [],

                    url: e.seo.url,

                    address: prop
                        ? `${prop.location.city} ${prop.location.microzone}`
                        : undefined,

                    latitude: prop?.location.latitude,
                    longitude: prop?.location.longitude,

                    rentalType: prop?.description
                        ?.toLowerCase()
                        .includes("doppia")
                        ? RentalTypes.DOUBLE_ROOM
                        : prop?.description?.toLowerCase().includes("singola")
                        ? RentalTypes.SINGLE_ROOM
                        : RentalTypes.OTHER,

                    hasElevator:
                        typeof prop?.hasElevators === "boolean"
                            ? prop.hasElevators
                            : undefined,

                    hasBalcony: prop?.ga4features.includes("balcone"),

                    // PURTROPPO non salva la data
                    date: new Date(),

                    authorUsername: e.realEstate.advertiser.agency?.displayName
                };

                // remove undefined entries
                Object.keys(obj).forEach(
                    key =>
                        obj[key as keyof typeof obj] === undefined &&
                        delete obj[key as keyof typeof obj]
                );

                return obj;
            });

        return posts;
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
            logger.info("Running Immobiliare scraper for city " + city);

            let scraped;
            try {
                scraped = await scraper.scrape(city);
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
        "Immobiliare scraper started with cron " + config.RUN_SCRAPER_CRON
    );
}

run();
