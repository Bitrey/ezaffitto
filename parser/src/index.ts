// DEVE essere primo senno' circular dependency => esplode
import "./config/kafka";

import { logger } from "./shared/logger";
import EventEmitter from "events";
import {
    ErrorEventEmitter,
    ParsedDataEventEmitter,
    ParsedPost,
    RawDataEventEmitter
} from "./interfaces/EventEmitters";
import { runConsumer } from "./consumer";
import { runProducer } from "./producer";
import { EdgeGPTParser } from "./parser/edgegpt";
import { Errors } from "./interfaces/Error";

const parser = new EdgeGPTParser();

export const rawDataEvent: RawDataEventEmitter = new EventEmitter();
export const parsedDataEvent: ParsedDataEventEmitter = new EventEmitter();
export const errorsEvent: ErrorEventEmitter = new EventEmitter();

const delay = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));

const run = async () => {
    //await delay(10000);
    runProducer();
    runConsumer();
};

run().catch(err => {
    logger.error("Error in Kafka run:");
    logger.error(err);
});

rawDataEvent.on("rawData", async rawData => {
    try {
        const [error, parsed] = await parser.parse(rawData.rawData.rawMessage);
        if (error) throw new Error(error);
        //TODO: think about this, do we want to just pass one part of json around or let everything through?
        parsedDataEvent.emit("parsedData", {
            scraperType: rawData.scraperType,
            scraperRawContent: rawData.rawData,
            post: parsed
        } as ParsedPost);
    } catch (err) {
        errorsEvent.emit("error", {
            err:
                (err instanceof Error && (err.message as Errors)) ||
                (err?.toString() as Errors) ||
                Errors.UNKNOWN_ERROR
        });
    }
});
