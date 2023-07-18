import Joi from "joi";

const rentalTypes = [
    "singleRoom",
    "doubleRoom",
    "studio",
    "apartment",
    "house",
    "other"
];
const sexRestrictions = ["everyone", "males", "females", "other"];
const occupationalRestrictions = ["everyone", "students", "workers", "other"];

export const scrapedParsedDataSchema = Joi.object({
    isRental: Joi.boolean().required(),
    isForRent: Joi.boolean().required(),
    description: Joi.string().required(),
    rentalType: Joi.string().valid(...rentalTypes),
    sourceType: Joi.string().required(),
    pictures: Joi.array().items(Joi.string()),
    url: Joi.string().required(),
    rawData: Joi.string(),
    monthlyPrice: Joi.number(),
    monthlyPricePerBed: Joi.number(),
    securityDepositMonths: Joi.number(),
    zone: Joi.string(),
    sexRestrictions: Joi.string().valid(...sexRestrictions),
    occupationalRestrictions: Joi.string().valid(...occupationalRestrictions),
    lgbtFriendly: Joi.boolean(),
    furnished: Joi.boolean(),
    availabilityStartDate: Joi.date(),
    availabilityEndDate: Joi.date(),
    contractDurationMonths: Joi.number(),
    hasBalcony: Joi.boolean(),
    hasParking: Joi.boolean(),
    address: Joi.string(),
    floorNumber: Joi.number(),
    rooms: Joi.number(),
    bathrooms: Joi.number(),
    areaSqMeters: Joi.number(),
    priceIncludesTaxes: Joi.boolean(),
    smokingAllowed: Joi.boolean(),
    latitude: Joi.number(),
    longitude: Joi.number()
});
