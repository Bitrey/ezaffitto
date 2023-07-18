import path from "path";

export const config = Object.freeze({
    RABBITMQ_URL: "amqp://localhost",
    RABBITMQ_EXCHANGE: "topic_exchange",

    PARSED_JSON_SCHEMA_PATH: path.join(
        process.cwd(),
        "/schemas/ScrapedParsedData.json"
    ),
    RAW_JSON_SCHEMA_PATH: path.join(
        process.cwd(),
        "/schemas/ScrapedRawData.json"
    ),

    METADATA_MAX_AGE: 50000,

    RAW_TOPIC: "scraper.scraped.*",
    PARSED_TOPIC: "parser.parsed.*",

    DB_API_SERVICE_HOST: "mongo",
    DB_API_SERVICE_PORT: 5500,
    DB_API_RAW_ROUTE: "/raw",
    DB_API_PARSED_ROUTE: "/parsed"
});
