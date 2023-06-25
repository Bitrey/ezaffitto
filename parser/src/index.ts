import express from "express";
import bodyParser from "body-parser";

// DEVE essere primo senno' circular dependency => esplode
import "./config/kafka";

import { envs } from "./config/envs";
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

const app = express();

app.use(bodyParser.json());

const parser = new EdgeGPTParser();

app.post("/parse", async (req, res) => {
    if (!req.body.text) {
        return res.status(400).json({ err: "Missing 'text' body parameter" });
    }
    const parsed = await parser.parse(req.body.text);

    if (parsed) {
        return res.json(parsed);
    } else {
        return res.status(500).json({ err: "Error parsing text" });
    }
});

app.listen(envs.PORT, () => {
    logger.info(`Parser server listening on port ${envs.PORT}`);
});

export const rawDataEvent: RawDataEventEmitter = new EventEmitter();
export const parsedDataEvent: ParsedDataEventEmitter = new EventEmitter();
export const errorsEvent: ErrorEventEmitter = new EventEmitter();

const delay = (ms:any) => new Promise(resolve => setTimeout(resolve, ms))

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
