import { envs } from "./envs";

export const config = Object.freeze({
    NODE_ENV: envs.NODE_ENV,
    PROMPT_PATH: envs.PROMPT_PATH,
    GPT_HOST: envs.GPT_HOST,
    GPT_PORT: envs.GPT_PORT,
    NUM_TRIES: 8,
    DELAY_BETWEEN_TRIES_MS: 3000,
    KAFKA_FROM_BEGINNING: false,
    PROXYCHAIN_ON: true,
    METADATA_MAX_AGE: 50000,
    KAFKA_CLIENT_ID: "parser",
    KAFKA_GROUP_ID: "parserGroup",
    KAFKA_BROKERS: ["kafka:9092"],
    KAFKA_CONSUMER_TOPIC: /scraper\.scraped\..*/,
    KAFKA_PRODUCER_TOPIC_PREFIX: "parser.parsed.",
    KAFKA_ERROR_TOPIC: "parser.error",
    RAW_DATA_MESSAGE_TO_PARSE_KEY: "rawMessage"
});
