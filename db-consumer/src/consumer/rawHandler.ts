import { config } from "../config";
import { logger } from "../shared/logger";
import axios, { AxiosResponse } from "axios";
import { Errors } from "../interfaces/Error";
import { scrapedRawDataSchema } from "../schemas/ScrapedRawData";

export async function rawDataHandler(scraperType: string, message: string) {
    logger.debug(`Saving raw data for scraperType ${scraperType}`);

    // TODO: Codice che fa cagare

    const url = `http://${config.DB_API_SERVICE_HOST}:${config.DB_API_SERVICE_PORT}${config.DB_API_RAW_ROUTE}`;

    const { error, value } = scrapedRawDataSchema.validate(JSON.parse(message));
    if (error) {
        logger.error("Error in Joi validation");
        throw new Error(Errors.PARSED_VALIDATION_FAILED);
    }

    let data: AxiosResponse;

    try {
        const res = await axios.post(url, message);
        data = res.data;
    } catch (err) {
        logger.error("Error while saving raw message to DB");
        throw new Error(Errors.RAW_DB_SAVE_FAILED);
    }

    logger.debug("Saved raw data to DB:", data);
    return data;
}
