import { scrapedDataEvent } from ".";
import { config } from "./config/config";
import { SentData } from "./interfaces/SentData";
import { logger } from "./shared/logger";

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

    logger.info(`RabbitMQ publisher publishing on topic ${config.TOPIC}...`);

    scrapedDataEvent.on("scrapedData", async data => {
        logger.info(
            "Sending data to RabbitMQ on topic " + config.TOPIC + "..."
        );

        const dataToSend: SentData = {
            postId: data.id,
            rawMessage: data.text,
            scraperRawData: data
        };

        channel.publish(
            config.RABBITMQ_EXCHANGE,
            config.TOPIC,
            Buffer.from(JSON.stringify(dataToSend))
        );
    });
};
