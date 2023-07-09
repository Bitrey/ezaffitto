export const config = Object.freeze({
    KAFKA_CLIENT_ID: "db-consumer",
    KAFKA_GROUP_ID: "dbConsumerGroup",
    KAFKA_BROKERS: ["kafka:9092"],

    KAFKA_FROM_BEGINNING: false,

    METADATA_MAX_AGE: 50000,

    KAFKA_RAW_TOPIC_PREFIX: "scraper.scraped.",
    KAFKA_RAW_TOPIC: /scraper\.scraped\..*/,
    KAFKA_PARSED_TOPIC_PREFIX: "parser.parsed.",
    KAFKA_PARSED_TOPIC: /parser\.parsed\..*/,

    DB_API_SERVICE_HOST: "mongo",
    DB_API_SERVICE_PORT: 5500,
    DB_API_RAW_ROUTE: "/raw",
    DB_API_PARSED_ROUTE: "/parsed"
});
