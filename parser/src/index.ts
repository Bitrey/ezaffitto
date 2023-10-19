import { logger } from "./shared/logger";
import EventEmitter from "events";
import { ParserEventEmitter } from "./interfaces/EventEmitters";
// import { runConsumer } from "./consumer";
// import { runProducer } from "./producer";
import Parser from "./parser/parser";

import express from "express";
import bodyParser from "body-parser";
import { envs } from "./config/envs";

import "./healthcheckPing";

const parser = new Parser();

export const appEventEmitter: ParserEventEmitter = new EventEmitter();

const run = async () => {
    logger.info("Starting RabbitMQ producer and consumer...");
    // config.RUN_PARSER
    //     ? runConsumer()
    //     : logger.warn("RUN_PARSER is false, not running consumer");
    // TODO runProducer
    logger.warn("DEBUG not running consumer");
    // runProducer();
};

run().catch(err => {
    logger.error("Error in RabbitMQ run:");
    logger.error(err);
});

if (envs.NODE_ENV === "development" && envs.DEBUG_START_EXPRESS_SERVER) {
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
            logger.error("Error in POST /parse");
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

// const instance = axios.create({
//     baseURL: config.DB_API_BASE_URL
// });

appEventEmitter.on("rawText", async ({ text }) => {
    try {
        // check if already exists (salva soldi, non fare parsing inutile)
        // TODO fai questo check altrove, non qui
        // const existsById = await instance.get(`/raw/postid/${postId}`);
        // const existsByText = await instance.get("/raw/text", {
        //     params: { text: rawMessage }
        // });
        // if (existsById.data || existsByText.data) {
        //     logger.debug(
        //         `Parsed data for postId ${postId} already exists (byId: ${
        //             JSON.stringify(existsById.data).slice(0, 30) + "..."
        //         }, byText: ${
        //             JSON.stringify(existsByText.data).slice(0, 30) + "..."
        //         }), skipping...`
        //     );
        //     return;
        // }
        // if (
        //     config.IGNORE_POSTS_WITH_KEYWORDS.some(keyword =>
        //         text.toLowerCase().includes(keyword)
        //     )
        // ) {
        //     logger.debug(
        //         `Post ${text.slice(
        //             30
        //         )}... with id ${text} contains one of the keywords to ignore, skipping...`
        //     );
        //     return;
        // }
        // if (config.DONT_PARSE_SERVICES.includes(source)) {
        //     logger.debug(
        //         `Post ${rawMessage.slice(
        //             30
        //         )}... with id ${postId} is a service to NOT parse (${source}), skipping...`
        //     );
        //     return;
        // }
        // const parsed = await parser.parse(text);
        // if (!parsed.isRental || !parsed.isForRent) {
        //     logger.info(
        //         `Parsed data for postId ${postId} is not a rental, skipping...`
        //     );
        //     notRentalsEvent.emit("notRental", {
        //         postId,
        //         source
        //     });
        //     return;
        // }
        // appEventEmitter.emit("rentalPost", parsed);
        // if (ampq) {
        //     ampq.channel.ack(ampq.message);
        // }
    } catch (err) {
        logger.error("Error in rawDataEvent handler");
        logger.error(err);
    }
});

appEventEmitter.on("rentalPost", async data => {
    logger.warn("Received rentalPost event");
    logger.warn(data);
});

// notRentalsEvent.on("notRental", async ({ postId }) => {
//     try {
//         await instance.post("/raw/not-rental/" + postId);
//     } catch (err) {
//         logger.error(`Error in notRentalsEvent handler for postId ${postId}:`);
//         logger.error(err);
//     }
// });
