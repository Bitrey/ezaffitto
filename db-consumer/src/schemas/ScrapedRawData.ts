import Joi from "joi";

interface IScrapedRawData {
    postId: string;
    rawMessage: string;
    scraperRawData: unknown;
}

export const scrapedRawDataSchema = Joi.object<IScrapedRawData>({
    postId: Joi.string(),
    rawMessage: Joi.string().required(),
    scraperRawData: Joi.object().required()
}).required();
