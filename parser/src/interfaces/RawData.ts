import { config } from "../config/config";

export interface RawData {
    [config.RAW_DATA_MESSAGE_TO_PARSE_KEY]: string;
    [key: string]: unknown;
}
