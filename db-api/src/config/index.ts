import "./db";

export const config = Object.freeze({
    SOURCE_TYPE_KEY: "source",
    POST_ID_KEY: "postId",
    SCRAPER_RAW_DATA_KEY: "scraperRawData",

    SCRAPER_TYPES: [
        "facebook",
        "subito",
        "bakeca",
        "zappyrent",
        "immobiliare"
    ] as const,

    EZAFFITTO_CITIES: [
        "bologna",
        "milano",
        "roma",
        "torino",
        "firenze",
        "napoli",
        "padova",
        "genova"
    ]
});
