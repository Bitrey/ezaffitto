import { Schema } from "express-validator";
import { config } from "../config";

const scrapedRawDataSchema: Schema = {
    [config.POST_ID_KEY]: {
        isString: true
    },
    [config.SOURCE_TYPE_KEY]: {
        isString: true,
        isIn: {
            options: [Object.values(config.SCRAPER_TYPES)]
        }
    },
    [config.RAW_MESSAGE_KEY]: {
        isString: true
    }
};

export default scrapedRawDataSchema;
