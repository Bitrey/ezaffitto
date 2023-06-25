import { envs } from "./envs";

export const config = Object.freeze({
    NODE_ENV: envs.NODE_ENV,
    NUM_TRIES: 5,
    DELAY_BETWEEN_TRIES_MS: 3000,
    KAFKA_FROM_BEGINNING: false,
    KAFKA_CLIENT_ID: "telegramChannel",
    KAFKA_GROUP_ID: "telegramChannelAll",
    KAFKA_BROKERS: ["kafka:9092"],
    KAFKA_CONSUMER_TOPIC: /^parser\.parsed\..+/, // scraper.scraped.*
    KAFKA_PRODUCER_TOPIC_PREFIX: "parser.parsed.",
    KAFKA_ERROR_TOPIC: "parser.error",
    RAW_DATA_MESSAGE_TO_PARSE_KEY: "rawMessage"
});