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

import express from "express";
import bodyParser from "body-parser";
import { envs } from "./config/envs";

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

// run().catch(err => {
//     logger.error("Error in Kafka run:");
//     logger.error(err);
// });

if (envs.NODE_ENV === "development") {
    logger.warn("Running in development mode, starting express server");

    const app = express();
    app.use(bodyParser.json());

    app.post("/parse", async (req, res) => {
        try {
            const resp = await parser.parse(req.body.text);
            console.log(resp);
            res.json(resp);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err });
        }
    });

    app.listen(3000, () => {
        logger.debug("Listening on port 3000");
    });
} else {
    logger.info(
        `Running in ${envs.NODE_ENV} mode, not starting express server`
    );
}

rawDataEvent.on("rawData", async rawData => {
    try {
        const [error, parsed] = await parser.parse(rawData.rawData.rawMessage);
        if (error) throw new Error(error);
        //TODO: think about this, do we want to just pass one part of json around or let everything through?
        parsedDataEvent.emit("parsedData", {
            scraperType: rawData.scraperType,
            scraperRawContent: rawData.rawData,
            post: parsed as any
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
