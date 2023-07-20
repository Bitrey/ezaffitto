import { Errors } from "../interfaces/Error";
import { config } from "../config";
import { logger } from "../shared/logger";
import { rawDataHandler } from "./rawHandler";
import { parsedDataHandler } from "./parsedHandler";

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

    const queue = await channel.assertQueue("", { exclusive: true });

    channel.bindQueue(queue.queue, config.RABBITMQ_EXCHANGE, config.RAW_TOPIC);
    channel.bindQueue(
        queue.queue,
        config.RABBITMQ_EXCHANGE,
        config.PARSED_TOPIC
    );

    logger.info(
        "RabbitMQ consumer listening on topics " +
            [config.RAW_TOPIC, config.PARSED_TOPIC].join(", ") +
            "..."
    );

    channel.consume(queue.queue, msg => {
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

        if (topic.startsWith(config.RAW_TOPIC_PREFIX)) {
            try {
                rawDataHandler(
                    topic.replace(config.RAW_TOPIC_PREFIX, ""),
                    msg.content.toString()
                );
                channel.ack(msg);
            } catch (err) {
                logger.error(err);
            }
        } else if (topic.startsWith(config.PARSED_TOPIC_PREFIX)) {
            try {
                parsedDataHandler(
                    topic.replace(config.PARSED_TOPIC_PREFIX, ""),
                    msg.content.toString()
                );
                channel.ack(msg);
            } catch (err) {
                logger.error(err);
            }
        } else {
            logger.error(`Topic ${topic} does not match the expected patterns`);
            throw new Error(Errors.RABBITMQ_RECEIVED_INVALID_TOPIC);
        }
    });
};
