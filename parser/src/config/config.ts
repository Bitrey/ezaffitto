import path from "path";
import { envs } from "./envs";

export const config = Object.freeze({
    NODE_ENV: envs.NODE_ENV,
    DEBUG_WAIT_MS: 0,
    DEBUG_START_EXPRESS_SERVER: true,
    DEBUG_USE_PROXY: true,
    NUM_TRIES: 1,
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
    RAW_DATA_MESSAGE_TO_PARSE_KEY: "rawMessage",
    EDGEGPT_FILE_PATH: path.join(process.cwd(), "parser.py"),
    GPT_MODEL: "gpt-3.5-turbo",
    GPT_ROLE:
        "You are ChatGPT, a large language model trained by OpenAI.\nYour task is to parse housing rental posts in JSON format and provide relevant information."
});
