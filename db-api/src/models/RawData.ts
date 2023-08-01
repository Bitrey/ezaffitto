import mongoose, { Schema } from "mongoose";
import { config } from "../config";

export interface IRawDataSchema extends mongoose.Document {
    [config.POST_ID_KEY]: string;
    [config.SOURCE_TYPE_KEY]: string;
    [config.RAW_MESSAGE_KEY]: string;
    [config.SCRAPER_RAW_DATA_KEY]: {
        [key: string]: unknown;
    };
    isRental?: boolean;
}

export const rawDataSchema = new Schema<IRawDataSchema>(
    {
        [config.POST_ID_KEY]: {
            type: String,
            required: true
        },
        [config.SOURCE_TYPE_KEY]: {
            type: String,
            required: true
        },
        [config.RAW_MESSAGE_KEY]: {
            type: String,
            required: true
        },
        [config.SCRAPER_RAW_DATA_KEY]: {
            type: Schema.Types.Mixed,
            required: true
        },
        isRental: {
            type: Boolean,
            required: false
        }
    },
    { timestamps: true }
);

const RawData = mongoose.model<IRawDataSchema>("RawData", rawDataSchema);

export default RawData;
