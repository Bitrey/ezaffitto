import { logger } from "../shared/logger";

export const config = Object.freeze({
    RABBITMQ_URL: "amqp://rabbitmq",
    RABBITMQ_EXCHANGE: "topic_exchange",

    METADATA_MAX_AGE: 50000,

    RAW_TOPIC: "scraper.scraped.*",
    RAW_TOPIC_PREFIX: "scraper.scraped.",

    PARSED_TOPIC: "parser.parsed.*",
    PARSED_TOPIC_PREFIX: "parser.parsed.",

    DB_API_BASE_URL: "http://db-api:5500/api",

    SCRAPER_TYPE_DB_KEY: "source",

    POST_ID_KEY: "postId",
    RAW_MESSAGE_KEY: "rawMessage",
    SCRAPER_RAW_DATA_KEY: "scraperRawData",

    RAW_DATA_SOURCE_KEY: "source"
});

logger.debug("Config: " + JSON.stringify(config, null, 4));
