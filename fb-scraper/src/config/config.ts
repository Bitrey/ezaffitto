import path from "path";

export const config = Object.freeze({
    DEBUG_RUN_SCRAPER: true,

    DB_API_BASE_URL: "http://db-api:5500/api/v1",
    PARSER_API_BASE_URL: "http://parser:3000/parse",

    COOKIES_JSON_PATH: path.join(process.cwd(), "/cookies/cookies.json"),
    SCREENSHOTS_PATH: path.join(process.cwd(), "/screenshots"),

    // between 30 minutes and 1 hour
    GET_COOKIE_CACHE_DURATION_MINUTES: () =>
        Math.floor(Math.random() * 30 + 30),

    REQUIRED_PROPS: ["id", "postUrl", "date", "text"],

    WARN_CLOSED_TIMES: 10,

    // random number between 20 and 40 seconds (in milliseconds)
    GET_DELAY_BETWEEN_SCRAPES_MS: () =>
        Math.floor(Math.random() * 20 * 1000) + 20 * 1000,

    RABBITMQ_URL: "amqp://rabbitmq",
    RABBITMQ_EXCHANGE: "topic_exchange",
    TOPIC: "scraper.scraped.facebook"
});
