import { Schema } from "express-validator";
import { config } from "../config";

const scrapedRawDataSchema: Schema = {
    [config.SOURCE_TYPE_KEY]: {
        isString: true,
        isIn: {
            options: [Object.values(config.SCRAPER_TYPES)],
            errorMessage: "Invalid source"
        }
    },
    [config.RAW_DATA_MESSAGE_TO_PARSE_KEY]: {
        isString: true,
        errorMessage: `Invalid ${config.RAW_DATA_MESSAGE_TO_PARSE_KEY}`
    }
};

export default scrapedRawDataSchema;
