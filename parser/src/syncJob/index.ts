import { CronJob } from "cron";

import { config } from "../config/config";
import { logger } from "../shared/logger";
import axios from "axios";
import { RawData } from "../interfaces/RawData";
import { rawDataEvent } from "..";

const instance = axios.create({
    baseURL: config.DB_API_BASE_URL
});

async function parseUnparsedPosts() {
    if (!config.RUN_PARSER) {
        logger.info("Parser is disabled, skipping sync job");
        return;
    }

    logger.info("Parsing unparsed posts...");

    let parsed: RawData[];

    try {
        const { data } = await instance.get("/raw", {
            params: {
                isRentalNotFalse: true,
                limit: config.MAX_RAW_DOCS_TO_SYNC
            }
        });
        parsed = data;
    } catch (err) {
        logger.error("Error while fetching raw posts");
        logger.error(err);
        return;
    }

    for (const p of parsed) {
        try {
            // il controllo se è già salvato viene già fatto dall'event listener
            logger.debug(`Parsing unparsed post ${p.postId}...`);

            rawDataEvent.emit("rawData", {
                postId: p.postId,
                source: p.source,
                rawMessage: p.rawMessage,
                scraperRawData: p.scraperRawData
            });
            // senno' openai ci throttla!!
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (err) {
            logger.error("Error while parsing post in sync job");
            logger.error(err);
            logger.error("Post:");
            logger.error(p);
        }
    }

    logger.info("Done parsing unparsed posts");
}

/** si occupa di tenere in sync il raw col parsed */
export const syncJob = new CronJob(
    "0 * * * *",
    parseUnparsedPosts,
    null,
    false,
    "Europe/Rome"
);
