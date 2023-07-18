import { config } from "../config";
import { logger } from "../shared/logger";
import axios, { AxiosResponse } from "axios";
import { Errors } from "../interfaces/Error";
import { scrapedParsedDataSchema } from "../schemas/ScrapedParsedData";

export async function parsedDataHandler(scraperType: string, message: string) {
    logger.debug(`Saving parsed data for scraperType ${scraperType}`);

    // TODO: Codice che fa cagare

    const url = `http://${config.DB_API_SERVICE_HOST}:${config.DB_API_SERVICE_PORT}${config.DB_API_PARSED_ROUTE}`;

    const { error, value } = scrapedParsedDataSchema.validate(
        JSON.parse(message)
    );
    if (error) {
        logger.error("Error in Joi validation");
        throw new Error(Errors.PARSED_VALIDATION_FAILED);
    }

    let data: AxiosResponse;

    try {
        const res = await axios.post(url, value);
        data = res.data;
    } catch (err) {
        logger.error("Error while saving parsed message to DB");
        throw new Error(Errors.PARSED_DB_SAVE_FAILED);
    }

    logger.debug("Saved parsed data to DB:", data);
    return data;
}
