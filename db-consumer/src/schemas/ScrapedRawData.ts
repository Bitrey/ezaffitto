import Joi from "joi";

export const scrapedRawDataSchema = Joi.object({
    postId: Joi.string(),
    rawMessage: Joi.string().required(),
    scraperRawData: Joi.object().required()
}).required();
