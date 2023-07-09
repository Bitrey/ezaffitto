import { KafkaMessage } from "kafkajs";
import { config } from "../config";
import { logger } from "../shared/logger";
import axios, { AxiosResponse } from "axios";
import { Errors } from "../interfaces/Error";

export async function rawDataHandler(
    scraperType: string,
    message: KafkaMessage & { value: Buffer }
) {
    logger.debug(`Saving raw data for scraperType ${scraperType}`);

    const url = `http://${config.DB_API_SERVICE_HOST}:${config.DB_API_SERVICE_PORT}${config.DB_API_RAW_ROUTE}`;

    // TODO! Fai validazione dati

    let data: AxiosResponse;

    try {
        const res = await axios.post(url, message.value);
        data = res.data;
    } catch (err) {
        logger.error("Error while saving raw message to DB");
        throw new Error(Errors.RAW_DB_SAVE_FAILED);
    }

    logger.debug("Saved raw data to DB:", data);
    return data;
}
