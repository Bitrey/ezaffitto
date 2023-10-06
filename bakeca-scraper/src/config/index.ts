export const config = Object.freeze({
    DEBUG_WAIT_MS: 0,
    DEBUG_RUN_SCRAPER: true,

    DB_API_BASE_URL: "http://db-api:5500/api/v1",

    AGENCY_TEXT: "agenzia",

    // random number between 20 and 40 seconds (in milliseconds)
    GET_DELAY_BETWEEN_SCRAPES_MS: () =>
        Math.floor(Math.random() * 20 * 1000) + 20 * 1000,

    RABBITMQ_URL: "amqp://rabbitmq",
    RABBITMQ_EXCHANGE: "topic_exchange",
    RAW_TOPIC: "scraper.scraped.bakeca",
    PARSED_TOPIC: "parser.parsed.bakeca"
});
