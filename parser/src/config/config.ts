import path from "path";

export const config = Object.freeze({
    DEBUG_WAIT_MS: 0,

    // post raw che verranno fetchati ed eventualmente parsati (cron job)
    MAX_RAW_DOCS_TO_SYNC: 100,

    IGNORE_POSTS_WITH_KEYWORDS: ["cerco", "cerca"],

    // se rielaborare la descrizione o lasciarla raw
    REPROCESS_POST_TEXT: false,

    NUM_TRIES: 1,
    DELAY_BETWEEN_TRIES_MS: 3000,
    RUN_PARSER: true,

    RABBITMQ_URL: "amqp://rabbitmq",
    RABBITMQ_EXCHANGE: "topic_exchange",

    RAW_TOPIC: "scraper.scraped.*",
    PARSED_TOPIC_PREFIX: "parser.parsed.",

    RAW_JSON_SCHEMA_PATH: path.join(
        process.cwd(),
        "/schemas/ScrapedRawDataWithoutRef.json"
    ),
    PARSED_JSON_SCHEMA_PATH: path.join(
        process.cwd(),
        "/schemas/ScrapedParsedDataWithoutMetadata.json"
    ),

    POST_ID_KEY: "postId",
    RAW_MESSAGE_KEY: "rawMessage",
    SCRAPER_RAW_DATA_KEY: "scraperRawData",

    RAW_DATA_SOURCE_KEY: "source",

    GPT_MODEL: "gpt-3.5-turbo",
    GPT_ROLE:
        "You are ChatGPT, a large language model trained by OpenAI.\nYour task is to parse housing rental posts in JSON format and provide relevant information.",
    MAX_GPT_TOKENS: 4096,
    OPENAI_ORGANIZATION: "org-BbXm9BbLn4ZtxoPh9K5hOGB2",

    DB_API_BASE_URL: "http://db-api:5500/api"
});
