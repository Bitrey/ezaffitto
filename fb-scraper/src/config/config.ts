export const config = Object.freeze({
    DEBUG_WAIT_MS: 0,

    CHROME_SERVICE_NAME: "chrome",

    REQUIRED_PROPS: ["id", "postUrl", "date", "text"],

    WARN_CLOSED_TIMES: 10,

    // 10 seconds to 30 seconds
    GET_DELAY_BETWEEN_SCRAPES_MS: () =>
        Math.floor(Math.random() * 20 * 1000) + 20 * 1000,

    RABBITMQ_URL: "amqp://rabbitmq",
    RABBITMQ_EXCHANGE: "topic_exchange",
    TOPIC: "scraper.scraped.facebook",

    // POST_ID_KEY: "postId",
    // RAW_MESSAGE_KEY: "rawMessage",
    // SCRAPER_RAW_DATA_KEY: "scraperRawData",
    // RAW_DATA_SOURCE_KEY: "source",

    GPT_MODEL: "gpt-3.5-turbo",
    GPT_ROLE:
        "You are ChatGPT, a large language model trained by OpenAI.\nYour task is to parse housing rental posts in JSON format and provide relevant information.",
    MAX_GPT_TOKENS: 4096,

    DB_API_BASE_URL: "http://db-api:5500/api"
});
