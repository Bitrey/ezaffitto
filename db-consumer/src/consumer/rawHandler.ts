import axios, { AxiosError } from "axios";
import { config } from "../config";
import { logger } from "../shared/logger";
import { Errors } from "../interfaces/Error";

const instance = axios.create({
    baseURL: config.DB_API_BASE_URL
});

export async function rawDataHandler(scraperType: string, message: string) {
    logger.debug(`Saving raw data for scraperType ${scraperType}`);

    let value;

    try {
        value = JSON.parse(message);
        if (!value.postId) {
            logger.error("Missing postId in rawDataHandler");
            throw new Error("Missing postId");
        }
    } catch (err) {
        logger.error("Error while JSON parsing message");
        throw new Error(Errors.RAW_MALFORMED_JSON);
    }

    // prendi source da suffisso topic RabbitMQ
    const obj = {
        [config.SCRAPER_TYPE_DB_KEY]: scraperType,
        ...value
    };

    try {
        await instance.post("/raw/validate", obj);
    } catch (err) {
        logger.error("Error while validating raw data");
        logger.error((err as AxiosError).response?.data || err);
        throw new Error(Errors.RAW_VALIDATION_FAILED);
    }

    try {
        const exists = await instance.get(`/raw/postid/${value.postId}`);

        if (exists.data) {
            // TODO: deve essere warning? (DEBUG)
            logger.debug(
                `Raw data for postId ${value.postId} already exists, skipping...`
            );
            return exists.data;
        }
    } catch (err) {
        logger.error("Error while checking if parsed data already exists");
        logger.error((err as AxiosError).response?.data || err);
        throw new Error(Errors.PARSED_DB_CHECK_FAILED);
    }

    let data;

    try {
        const res = await instance.post("/raw", obj);
        data = res.data;
    } catch (err) {
        logger.error("Error while saving raw message to DB");
        logger.error((err as AxiosError).response?.data || err);
        throw new Error(Errors.RAW_DB_SAVE_FAILED);
    }

    logger.debug(`Saved raw data to DB (postId: ${data.postId})`);
    return data;
}
