import path from "path";

export const config = Object.freeze({
    DEBUG_RUN_SCRAPER: true,

    DB_API_BASE_URL: "http://db-api:5500/api/v1",

    URLS_JSON_PATH: path.join(process.cwd(), "urls.json"),

    // every minute
    RUN_SCRAPER_CRON: "* * * * *",

    RABBITMQ_URL: "amqp://rabbitmq",
    RABBITMQ_EXCHANGE: "topic_exchange",
    RAW_TOPIC: "scraper.scraped.immobiliare", // no need to run parser, it's already parsed
    PARSED_TOPIC: "parser.parsed.immobiliare"
});
