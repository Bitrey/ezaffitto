import { config } from "../config";
import { logger } from "../shared/logger";
import axios, { AxiosError } from "axios";
import { Errors } from "../interfaces/Error";
import { ParsedData, RentalPost } from "../interfaces/RentalPost";
import { mapFBPostToFullDoc } from "../mapRawToParsed/facebook";

const instance = axios.create({
    baseURL: config.DB_API_BASE_URL
});

export async function parsedDataHandler(scraperType: string, message: string) {
    logger.debug(`Saving parsed data for scraperType ${scraperType}`);

    let rabbitMqJson: { postId: string; post: ParsedData };
    try {
        rabbitMqJson = JSON.parse(message);
        if (!rabbitMqJson.postId) {
            logger.error("Missing postId in parsedHandler");
            throw new Error("Missing postId");
        }
    } catch (err) {
        logger.error("Error while JSON parsing message");
        throw new Error(Errors.PARSED_MALFORMED_JSON);
    }

    const { post } = rabbitMqJson;

    // Se questo è true è un serio problema: il parser ha
    // girato su dati già parsati, abbiamo perso soldi
    try {
        const exists = await instance.get(
            `/parsed/postid/${rabbitMqJson.postId}`
        );

        if (exists.data) {
            logger.warn(
                `Parsed data for postId ${rabbitMqJson.postId} already exists, skipping...`
            );
            return exists.data;
        }
    } catch (err) {
        logger.error("Error while checking if parsed data already exists");
        logger.error((err as AxiosError).response?.data || err);
        throw new Error(Errors.PARSED_DB_CHECK_FAILED);
    }

    let raw = null;
    try {
        const { data } = await instance.get(
            `/raw/postid/${rabbitMqJson.postId}`
        );
        raw = data;
    } catch (err) {
        logger.error("Error while fetching raw data");
        logger.error((err as AxiosError).response?.data || err);
        throw new Error(Errors.ERROR_FETCHING_RAW_DATA);
    }

    if (!raw) {
        logger.error(
            `Raw data for postId ${rabbitMqJson.postId} does not exist`
        );
        throw new Error(Errors.RAW_DATA_NOT_FOUND);
    }

    let mapped: RentalPost;

    if (scraperType === "facebook") {
        try {
            mapped = await mapFBPostToFullDoc(
                rabbitMqJson.postId,
                raw[config.SCRAPER_RAW_DATA_KEY],
                post,
                raw._id
            );
        } catch (err) {
            logger.error(
                "Error while mapping raw Facebook data to parsed data"
            );
            logger.error((err as AxiosError).response?.data || err);
            throw new Error(Errors.FB_PARSING_FAILED);
        }
    } else {
        logger.error(`Scraper type ${scraperType} not supported`);
        throw new Error(Errors.RECEIVED_INVALID_SCRAPER_TYPE);
    }

    try {
        await instance.post("/parsed/validate", mapped);
    } catch (err) {
        logger.error("Error while validating parsed data");
        logger.error((err as AxiosError).response?.data || err);
        logger.error("Parsed data:");
        logger.error(mapped);
        throw new Error(Errors.PARSED_VALIDATION_FAILED);
    }

    let dbObj;

    try {
        const { data } = await instance.post("/parsed", mapped);
        dbObj = data;
    } catch (err) {
        logger.error("Error while saving parsed message to DB");
        logger.error((err as AxiosError).response?.data || err);
        throw new Error(Errors.PARSED_DB_SAVE_FAILED);
    }

    logger.info(`Saved parsed data to DB (postId: ${dbObj.postId})`);

    logger.debug("dbObj:");
    logger.debug(dbObj);

    return dbObj;
}
