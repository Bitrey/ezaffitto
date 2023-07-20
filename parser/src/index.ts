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
import axios from "axios";
import { syncJob } from "./syncJob";

const parser = new Parser();

export const rawDataEvent: RawDataEventEmitter = new EventEmitter();
export const parsedDataEvent: ParsedDataEventEmitter = new EventEmitter();
export const errorsEvent: ErrorEventEmitter = new EventEmitter();

const delay = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));

const run = async () => {
    if (config.NODE_ENV === "development") await delay(config.DEBUG_WAIT_MS);

    logger.info("Starting RabbitMQ producer and consumer...");
    envs.RUN_PARSER
        ? runConsumer()
        : logger.warn("RUN_PARSER is false, not running consumer");
    runProducer();

    syncJob.start();
};

run().catch(err => {
    logger.error("Error in RabbitMQ run:");
    logger.error(err);
});

if (config.NODE_ENV === "development" && envs.DEBUG_START_EXPRESS_SERVER) {
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

const instance = axios.create({
    baseURL: config.DB_API_BASE_URL
});

rawDataEvent.on("rawData", async ({ postId, source, rawMessage }) => {
    try {
        // check if already exists (salva soldi, non fare parsing inutile)
        const { data } = await instance.get(`/parsed/postid/${postId}`);
        if (data) {
            logger.debug(
                `Parsed data for postId ${postId} already exists, skipping...`
            );
            return;
        }

        const parsed = await parser.parse(rawMessage);

        if (!parsed.isRental || !parsed.isForRent) {
            logger.info(
                `Parsed data for postId ${postId} is not a rental, skipping...`
            );
            return;
        }

        parsedDataEvent.emit("parsedData", {
            postId,
            source,
            post: parsed
        });
    } catch (err) {
        errorsEvent.emit("error", {
            err:
                (err instanceof Error && (err.message as Errors)) ||
                (err?.toString() as Errors) ||
                Errors.UNKNOWN_ERROR
        });
    }
});
