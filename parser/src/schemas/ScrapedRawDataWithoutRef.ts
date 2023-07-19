import Joi from "joi";
import { RawData } from "../interfaces/RawData";
import { config } from "../config/config";

export const scrapedRawDataSchema = Joi.object<RawData>({
    [config.POST_ID_KEY]: Joi.string().required(),
    [config.RAW_MESSAGE_KEY]: Joi.string().required(),
    [config.SCRAPER_RAW_DATA_KEY]: Joi.object().required()
});
