import "./db";

export const config = Object.freeze({
    SOURCE_TYPE_KEY: "source",
    RAW_DATA_MESSAGE_TO_PARSE_KEY: "rawMessage",
    SCRAPER_TYPES: ["facebook"] as const
});
