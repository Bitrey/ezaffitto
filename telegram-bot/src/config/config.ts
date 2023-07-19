import { envs } from "./envs";

export const config = Object.freeze({
    NODE_ENV: envs.NODE_ENV,
    NUM_TRIES: 5,
    DELAY_BETWEEN_TRIES_MS: 3000,

    RABBITMQ_URL: "amqp://rabbitmq",
    RABBITMQ_EXCHANGE: "topic_exchange",

    PARSED_TOPIC: "parser.parsed.*",

    RAW_MESSAGE_KEY: "rawMessage"
});
