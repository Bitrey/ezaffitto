import axios, { AxiosError } from "axios";
import { config } from "../config";
import { logger } from "../shared/logger";
import { Errors } from "../interfaces/Error";
import { scrapedRawDataSchema } from "../schemas/ScrapedRawData";

const instance = axios.create({
    baseURL: config.DB_API_BASE_URL
});

export async function rawDataHandler(scraperType: string, message: string) {
    logger.debug(`Saving raw data for scraperType ${scraperType}`);

    const { error, value } = scrapedRawDataSchema.validate(JSON.parse(message));
    if (error) {
        logger.error(`Error in Joi validation while validating ${message}:`);
        logger.error(error);
        throw new Error(Errors.PARSED_VALIDATION_FAILED);
    }

    try {
        const exists = await instance.get(`/raw/postid/${value.postId}`);

        if (exists.data) {
            logger.warn(
                `Raw data for postId ${value.postId} already exists, skipping...`
            );
            return exists.data;
        }
    } catch (err) {
        logger.error("Error while checking if parsed data already exists");
        logger.error((err as AxiosError).response?.data || err);
        throw new Error(Errors.PARSED_DB_CHECK_FAILED);
    }

    const obj = {
        [config.SCRAPER_TYPE_DB_KEY]: scraperType,
        ...value
    };

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
