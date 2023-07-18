import { config } from "../config";
import { logger } from "../shared/logger";
import axios, { AxiosResponse } from "axios";
import { Errors } from "../interfaces/Error";
import Ajv from "ajv";
import { readFile } from "fs/promises";

export async function rawDataHandler(scraperType: string, message: string) {
    logger.debug(`Saving raw data for scraperType ${scraperType}`);

    // TODO: Codice che fa cagare

    const url = `http://${config.DB_API_SERVICE_HOST}:${config.DB_API_SERVICE_PORT}${config.DB_API_RAW_ROUTE}`;

    const ajv = new Ajv();
    const schema = await readFile(config.RAW_JSON_SCHEMA_PATH, "utf-8");

    const validate = ajv.compile(JSON.parse(schema));
    const valid = validate(JSON.parse(message));

    if (!valid) {
        logger.error("Error while validating raw message");
        throw new Error(Errors.RAW_VALIDATION_FAILED);
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
