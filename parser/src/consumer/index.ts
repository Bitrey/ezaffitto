import { rawDataEvent } from "..";
import { config } from "../config/config";
import { Errors } from "../interfaces/Error";
import { RawData } from "../interfaces/RawData";
import { scraperRawDataSchema } from "../schemas/ScrapedRawDataWithoutRef";
import { logger } from "../shared/logger";

import * as amqp from "amqplib";
import exitHook from "async-exit-hook";

export const runConsumer = async () => {
    const connection = await amqp.connect(config.RABBITMQ_URL);
    const channel = await connection.createChannel();

    exitHook(() => {
        logger.info(`Closing RabbitMQ consumer connection...`);
        connection.close();
    });

    await channel.assertExchange(config.RABBITMQ_EXCHANGE, "topic", {
        durable: true
    });

    const queue = await channel.assertQueue("", { durable: true });

    channel.bindQueue(queue.queue, config.RABBITMQ_EXCHANGE, config.RAW_TOPIC);

    logger.info(
        "RabbitMQ consumer listening on topics " + config.RAW_TOPIC + "..."
    );

    try {
        channel.consume(
            queue.queue,
            async msg => {
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
                        logger.error(
                            `Invalid topic received from RabbitMQ: ${topic}.`
                        );
                        throw new Error(
                            Errors.RABBITMQ_RECEIVED_INVALID_SCRAPER_TYPE
                        );
                    }

                    let parsed: RawData;
                    try {
                        parsed = JSON.parse(msg.content.toString("utf-8"));
                    } catch (err) {
                        logger.error(
                            `Malformed JSON data received from RabbitMQ: ${msg}.`
                        );
                        throw new Error(
                            Errors.RABBITMQ_RECEIVED_MALFORMED_RAW_DATA
                        );
                    }

                    // Controlla che abbia rawMessage
                    const { error, value } =
                        scraperRawDataSchema.validate(parsed);
                    if (error) {
                        logger.error("Error in Joi validation:");
                        logger.error(error);
                        logger.error(parsed);
                        throw new Error(
                            Errors.RABBITMQ_RECEIVED_INVALID_RAW_DATA
                        );
                    }

                    logger.debug(
                        `Data from "${scraperType}" scraper JSONified successfully`
                    );

                    rawDataEvent.emit("rawData", {
                        ampq: { channel, message: msg },
                        postId: value.postId,
                        source: scraperType,
                        rawMessage: value.rawMessage,
                        scraperRawData: value.scraperRawData
                    });
                } catch (error) {
                    logger.error(
                        "An error occurred in the RabbitMQ consumer:",
                        error
                    );
                }
            },
            { noAck: true }
        );
    } catch (err) {
        logger.error("Error in RabbitMQ consumer");
        logger.error(err);
    }
};
