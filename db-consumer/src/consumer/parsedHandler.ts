import { config } from "../config";
import { logger } from "../shared/logger";
import axios, { AxiosError } from "axios";
import { Errors } from "../interfaces/Error";
import { scrapedParsedDataSchema } from "../schemas/ScrapedParsedData";

const instance = axios.create({
    baseURL: config.DB_API_BASE_URL
});

export async function parsedDataHandler(scraperType: string, message: string) {
    logger.debug(`Saving parsed data for scraperType ${scraperType}`);

    const { error, value } = scrapedParsedDataSchema.validate(
        JSON.parse(message)
    );
    if (error) {
        logger.error(`Error in Joi validation while validating ${message}:`);
        logger.error(error);
        throw new Error(Errors.PARSED_VALIDATION_FAILED);
    }

    // Se è true è un serio problema: il parser ha girato su dati già parsati,
    // abbiamo perso soldi

    try {
        const exists = await instance.get(`/parsed/postid/${value.postId}`);

        if (exists.data) {
            logger.warn(
                `Parsed data for postId ${value.postId} already exists, skipping...`
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
        const res = await instance.post("/parsed", value);
        data = res.data;
    } catch (err) {
        logger.error("Error while saving parsed message to DB");
        logger.error((err as AxiosError).response?.data || err);
        throw new Error(Errors.PARSED_DB_SAVE_FAILED);
    }

    logger.debug(`Saved parsed data to DB (postId: ${data.postId})`);

    return data;
}
