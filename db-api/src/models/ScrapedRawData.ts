import mongoose, { Schema } from "mongoose";
import { scraperTypes } from "../config/scraperTypes";
import { config } from "../config";

interface IScrapedRawDataSchema extends mongoose.Document {
    type: string;
    [config.RAW_DATA_MESSAGE_TO_PARSE_KEY]: string;
    [key: string]: unknown;
}

const scrapedRawDataSchema = new Schema<IScrapedRawDataSchema>(
    {
        type: {
            type: String,
            enum: Object.values(scraperTypes),
            required: true
        },
        [config.RAW_DATA_MESSAGE_TO_PARSE_KEY]: {
            type: String,
            required: true
        }
    },
    { strict: false }
);

export const ScrapedRawData = mongoose.model<IScrapedRawDataSchema>(
    "ScrapedRawData",
    scrapedRawDataSchema
);
