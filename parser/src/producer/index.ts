import { errorsEvent, parsedDataEvent } from "..";
import { config } from "../config/config";
import { AppError } from "../interfaces/Error";
import { ParsedPost } from "../interfaces/EventEmitters";
import { logger } from "../shared/logger";

import * as amqp from "amqplib";
import { readFile } from "fs/promises";

export const runProducer = async () => {
    const connection = await amqp.connect(config.RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(config.RABBITMQ_EXCHANGE, "topic", {
        durable: false
    });

    logger.info(
        `RabbitMQ publisher publishing on topic ${config.PARSED_TOPIC_PREFIX}*...`
    );

    parsedDataEvent.on("parsedData", async data => {
        const topic = config.PARSED_TOPIC_PREFIX + data.scraperType;

        logger.info("Sending data to RabbitMQ on topic " + topic + "...");

        channel.publish(
            config.RABBITMQ_EXCHANGE,
            topic,
            Buffer.from(JSON.stringify(data as ParsedPost))
        );
    });
    errorsEvent.on("error", async error => {
        logger.info(
            `Sending error to RabbitMQ on topic ${config.ERROR_TOPIC}...`
        );

        channel.publish(
            config.RABBITMQ_EXCHANGE,
            config.ERROR_TOPIC,
            Buffer.from(JSON.stringify(error as AppError))
        );
    });
};
