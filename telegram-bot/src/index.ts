import { Telegraf } from "telegraf";
import { envs } from "./config/envs";
import { config } from "./config/config";
import { logger } from "./shared/logger";
import { Errors } from "./interfaces/Error";
import { RentalPost } from "./interfaces/RentalPost";
import { generateTelegramMessageFromJson } from "./messageformat";

import * as amqp from "amqplib";

const delay = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));

const bot = new Telegraf(envs.BOT_TOKEN);
//bot.telegram.sendMessage(envs.CHANNEL_ID, 'AM ALIVE')
logger.info("channel_id: ", envs.CHANNEL_ID);

export const runConsumer = async () => {
    const connection = await amqp.connect(config.RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(config.RABBITMQ_EXCHANGE, "topic", {
        durable: true
    });

    const queue = await channel.assertQueue("", { exclusive: true });

    channel.bindQueue(
        queue.queue,
        config.RABBITMQ_EXCHANGE,
        config.PARSED_TOPIC
    );
    channel.bindQueue(
        queue.queue,
        config.RABBITMQ_EXCHANGE,
        config.PARSED_TOPIC
    );

    logger.info(
        `RabbitMQ consumer listening on topic ${config.PARSED_TOPIC}...`
    );

    channel.consume(queue.queue, async msg => {
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

        let parsed: RentalPost;
        try {
            console.log(msg.content.toString("utf-8"));
            parsed = JSON.parse(msg.content.toString("utf-8"))["post"];
            //console.log(parsed)
            // GUARDS GO HERE
            // TODO: extrapolate in another function maybe
            if (parsed.isRental && parsed.isForRent) {
                try {
                    await bot.telegram.sendMessage(
                        envs.CHANNEL_ID,
                        generateTelegramMessageFromJson(parsed),
                        { parse_mode: "MarkdownV2" }
                    );
                } catch (err) {
                    logger.error(`Telegram error`);
                }
                logger.debug("Sleeping before sending next message...");
                delay(5000);
            }
        } catch (err) {
            logger.error(
                `Malformed JSON data received from RabbitMQ: ${msg.content.toString(
                    "utf-8"
                )}.`
            );
            throw new Error(Errors.RABBITMQ_RECEIVED_MALFORMED_JSON);
        }
    });
};

const run = async () => {
    await delay(10000);
    runConsumer();
};

run().catch(err => {
    logger.error("Error in RabbitMQ run:");
    logger.error(err);
});
