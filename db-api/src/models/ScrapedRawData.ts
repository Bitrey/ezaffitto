import mongoose, { Schema } from "mongoose";
import { config } from "../config";

interface IScrapedRawDataSchema extends mongoose.Document {
    [config.SOURCE_TYPE_KEY]: string;
    [config.RAW_DATA_MESSAGE_TO_PARSE_KEY]: string;
    [key: string]: unknown;
}

const scrapedRawDataSchema = new Schema<IScrapedRawDataSchema>(
    {
        [config.SOURCE_TYPE_KEY]: {
            type: String,
            enum: Object.values(config.SCRAPER_TYPES),
            required: true
        },
        [config.RAW_DATA_MESSAGE_TO_PARSE_KEY]: {
            type: String,
            required: true
        }
    },
    { strict: false, timestamps: true }
);

export const ScrapedRawData = mongoose.model<IScrapedRawDataSchema>(
    "ScrapedRawData",
    scrapedRawDataSchema
);
