import { config } from "../config";

export interface RawData {
    [config.POST_ID_KEY]: string;
    [config.RAW_MESSAGE_KEY]: string;
    [key: string]: unknown;
}
