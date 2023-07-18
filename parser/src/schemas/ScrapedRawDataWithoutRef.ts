import Joi from "joi";

export const scrapedRawDataSchema = Joi.object({
    postId: Joi.string().required(),
    rawMessage: Joi.string().required()
});
