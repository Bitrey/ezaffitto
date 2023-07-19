import { config } from "../config/config";

export interface RawData {
    [config.POST_ID_KEY]: string;
    [config.RAW_DATA_SOURCE_KEY]: string;
    [config.RAW_MESSAGE_KEY]: string;
    [config.SCRAPER_RAW_DATA_KEY]: {
        [key: string]: unknown;
    };
}
