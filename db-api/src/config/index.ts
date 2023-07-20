import "./db";

export const config = Object.freeze({
    SOURCE_TYPE_KEY: "source",
    POST_ID_KEY: "postId",
    RAW_MESSAGE_KEY: "rawMessage",
    SCRAPER_RAW_DATA_KEY: "scraperRawData",

    SCRAPER_TYPES: ["facebook"] as const
});
