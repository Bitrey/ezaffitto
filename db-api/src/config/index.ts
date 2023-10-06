import "./db";

export const config = Object.freeze({
    SOURCE_TYPE_KEY: "source",
    POST_ID_KEY: "postId",
    SCRAPER_RAW_DATA_KEY: "scraperRawData",

    TURNSTILE_URL: "https://challenges.cloudflare.com/turnstile/v0/siteverify",

    SCRAPER_TYPES: ["facebook", "subito", "bakeca", "zappyrent"] as const
});
