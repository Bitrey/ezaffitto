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
import Parser from "./parser/parser";
import { Errors } from "./interfaces/Error";

import express from "express";
import bodyParser from "body-parser";
import { envs } from "./config/envs";
import { config } from "./config/config";

const parser = new Parser();

export const rawDataEvent: RawDataEventEmitter = new EventEmitter();
export const parsedDataEvent: ParsedDataEventEmitter = new EventEmitter();
export const errorsEvent: ErrorEventEmitter = new EventEmitter();

const delay = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));

const run = async () => {
    if (config.NODE_ENV === "development") await delay(config.DEBUG_WAIT_MS);
    logger.info("Starting RabbitMQ producer and consumer...");
    runProducer();
    runConsumer();
};

// run().catch(err => {
//     logger.error("Error in RabbitMQ run:");
//     logger.error(err);
// });

if (config.NODE_ENV === "development" && config.DEBUG_START_EXPRESS_SERVER) {
    logger.warn("Running in development mode, starting express server");

    const app = express();
    app.use(bodyParser.json());

    app.post("/parse", async (req, res) => {
        logger.debug("Received POST request to /parse");

        if (!req.body.text) {
            res.status(400).json({ error: "Missing text field" });
            return;
        }
        try {
            const resp = await parser.parse(req.body.text);
            // console.log(resp);
            res.json(resp);
        } catch (err) {
            logger.error(err);
            res.status(500).json({ error: err });
        }
    });

    app.listen(3000, () => {
        logger.debug("Listening on port 3000");
    });
} else {
    logger.info(
        `Running in ${envs.NODE_ENV} mode and not starting express server`
    );
}

rawDataEvent.on("rawData", async ({ rawData, scraperType }) => {
    try {
        const parsed = await parser.parse(rawData.rawMessage);

        parsedDataEvent.emit("parsedData", {
            scraperType: scraperType,
            scraperRawContent: rawData,
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
