import { parsedDataEvent } from "..";
import { config } from "../config/config";
import { ParsedPostWithoutSource } from "../interfaces/EventEmitters";
import { logger } from "../shared/logger";

import * as amqp from "amqplib";
import exitHook from "async-exit-hook";

export const runProducer = async () => {
    const connection = await amqp.connect(config.RABBITMQ_URL);
    const channel = await connection.createChannel();

    exitHook(() => {
        logger.info(`Closing RabbitMQ producer connection...`);
        connection.close();
    });

    await channel.assertExchange(config.RABBITMQ_EXCHANGE, "topic", {
        durable: true
    });

    logger.info(
        `RabbitMQ publisher publishing on topic ${config.PARSED_TOPIC_PREFIX}[*]...`
    );

    parsedDataEvent.on("parsedData", async data => {
        const topic = config.PARSED_TOPIC_PREFIX + data.source;

        logger.info("Sending data to RabbitMQ on topic " + topic + "...");

        // rimuovi il campo source
        const dataToSend: ParsedPostWithoutSource = (({ source, ...o }) => o)(
            data
        );

        channel.publish(
            config.RABBITMQ_EXCHANGE,
            topic,
            Buffer.from(JSON.stringify(dataToSend))
        );
    });
};
