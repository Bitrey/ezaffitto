import path from "path";
import { envs } from "./envs";

export const config = Object.freeze({
    NODE_ENV: envs.NODE_ENV,
    DEBUG_WAIT_MS: 0,
    DEBUG_START_EXPRESS_SERVER: true,

    NUM_TRIES: 1,
    DELAY_BETWEEN_TRIES_MS: 3000,

    RABBITMQ_URL: "amqp://localhost",
    RABBITMQ_EXCHANGE: "topic_exchange",

    RAW_TOPIC: "scraper.scraped.*",
    PARSED_TOPIC_PREFIX: "parser.parsed.",
    ERROR_TOPIC: "parser.error",

    RAW_JSON_SCHEMA_PATH: path.join(
        process.cwd(),
        "/schemas/ScrapedRawDataWithoutRef.json"
    ),
    PARSED_JSON_SCHEMA_PATH: path.join(
        process.cwd(),
        "/schemas/ScrapedParsedDataWithoutMetadata.json"
    ),

    RAW_DATA_POST_ID_KEY: "postId",
    RAW_DATA_MESSAGE_TO_PARSE_KEY: "rawMessage",

    GPT_MODEL: "gpt-3.5-turbo",
    GPT_ROLE:
        "You are ChatGPT, a large language model trained by OpenAI.\nYour task is to parse housing rental posts in JSON format and provide relevant information."
});
