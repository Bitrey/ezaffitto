import Ajv from "ajv";
import { rawDataEvent } from "..";
import { config } from "../config/config";
import { Errors } from "../interfaces/Error";
import { RawDataWithType } from "../interfaces/EventEmitters";
import { RawData } from "../interfaces/RawData";
import { logger } from "../shared/logger";

import * as amqp from "amqplib";
import { readFile } from "fs/promises";

export const runConsumer = async () => {
    const connection = await amqp.connect(config.RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(config.RABBITMQ_EXCHANGE, "topic", {
        durable: false
    });

    const queue = await channel.assertQueue("", { exclusive: true });

    channel.bindQueue(queue.queue, config.RABBITMQ_EXCHANGE, config.RAW_TOPIC);

    logger.info(
        "RabbitMQ consumer listening on topics " + config.RAW_TOPIC + "..."
    );

    channel.consume(queue.queue, async msg => {
        try {
            if (msg === null) {
                logger.error("Received null message from RabbitMQ");
                throw new Error(Errors.RABBITMQ_RECEIVED_NULL_MESSAGE);
            }

            const topic = msg.fields.routingKey;

            logger.debug(
                `Received message from RabbitMQ at topic "${topic}": ${
                    msg.content.toString().substring(0, 30) + "..."
                }`
            );

            const scraperType = topic.replace("scraper.scraped.", "");

            if (!scraperType) {
                logger.error(`Invalid topic received from RabbitMQ: ${topic}.`);
                throw new Error(Errors.RABBITMQ_RECEIVED_INVALID_SCRAPER_TYPE);
            }

            let parsed: RawData;
            try {
                parsed = JSON.parse(msg.content.toString("utf-8"));
            } catch (err) {
                logger.error(
                    `Malformed JSON data received from RabbitMQ: ${msg}.`
                );
                throw new Error(Errors.RABBITMQ_RECEIVED_MALFORMED_RAW_DATA);
            }

            // Controlla che abbia rawMessage
            const ajv = new Ajv();
            const schema = await readFile(config.RAW_JSON_SCHEMA_PATH, "utf-8");

            const validate = ajv.compile(JSON.parse(schema));
            const valid = validate(parsed);

            if (!valid) {
                logger.error("Error while validating raw message");
                throw new Error(Errors.RABBITMQ_RECEIVED_INVALID_RAW_DATA);
            }

            logger.debug(
                `Data from "${scraperType}" scraper JSONified successfully`
            );

            rawDataEvent.emit("rawData", {
                scraperType,
                rawData: parsed
            } as RawDataWithType);
        } catch (error) {
            logger.error("An error occurred in the RabbitMQ consumer:", error);
        }
    });
};
