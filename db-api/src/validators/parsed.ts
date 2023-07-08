import { Schema } from "express-validator";
import {
    occupationalRestrictions,
    rentalTypes,
    sexRestrictions
} from "../models/ScrapedParsedData";

const scrapedParsedDataSchema: Schema = {
    isRental: {
        isBoolean: true,
        errorMessage: "Invalid value for isRental"
    },
    isForRent: {
        isBoolean: true,
        errorMessage: "Invalid value for isForRent"
    },
    description: {
        isString: true,
        errorMessage: "Invalid description"
    },
    rentalType: {
        optional: true,
        isIn: {
            options: [Object.values(rentalTypes)],
            errorMessage: "Invalid rentalType"
        }
    },
    sourceType: {
        isString: true,
        errorMessage: "Invalid sourceType"
    },
    pictures: {
        optional: true,
        isArray: true,
        errorMessage: "Invalid pictures",
        custom: {
            options: value =>
                Array.isArray(value) &&
                value.every(item => typeof item === "string"),
            errorMessage: "Invalid pictures"
        }
    },
    url: {
        isURL: {
            errorMessage: "Invalid URL"
        }
    },
    rawData: {
        optional: true,
        isMongoId: true,
        errorMessage: "Invalid rawData"
    },
    monthlyPrice: {
        optional: true,
        isNumeric: true,
        errorMessage: "Invalid monthlyPrice"
    },
    monthlyPricePerBed: {
        optional: true,
        isNumeric: true,
        errorMessage: "Invalid monthlyPricePerBed"
    },
    securityDepositMonths: {
        optional: true,
        isNumeric: true,
        errorMessage: "Invalid securityDepositMonths"
    },
    zone: {
        optional: true,
        isString: true,
        errorMessage: "Invalid zone"
    },
    sexRestrictions: {
        optional: true,
        isIn: {
            options: [Object.values(sexRestrictions)],
            errorMessage: "Invalid sexRestrictions"
        }
    },
    occupationalRestrictions: {
        optional: true,
        isIn: {
            options: [Object.values(occupationalRestrictions)],
            errorMessage: "Invalid occupationalRestrictions"
        }
    },
    lgbtFriendly: {
        optional: true,
        isBoolean: true,
        errorMessage: "Invalid value for lgbtFriendly"
    },
    furnished: {
        optional: true,
        isBoolean: true,
        errorMessage: "Invalid value for furnished"
    },
    availabilityStartDate: {
        optional: true,
        isISO8601: true,
        toDate: true,
        errorMessage: "Invalid availabilityStartDate"
    },
    availabilityEndDate: {
        optional: true,
        isISO8601: true,
        toDate: true,
        errorMessage: "Invalid availabilityEndDate"
    },
    contractDurationMonths: {
        optional: true,
        isNumeric: true,
        errorMessage: "Invalid contractDurationMonths"
    },
    hasBalcony: {
        optional: true,
        isBoolean: true,
        errorMessage: "Invalid value for hasBalcony"
    },
    hasParking: {
        optional: true,
        isBoolean: true,
        errorMessage: "Invalid value for hasParking"
    },
    address: {
        optional: true,
        isString: true,
        errorMessage: "Invalid address"
    },
    floorNumber: {
        optional: true,
        isNumeric: true,
        errorMessage: "Invalid floorNumber"
    },
    rooms: {
        optional: true,
        isNumeric: true,
        errorMessage: "Invalid number of rooms"
    },
    bathrooms: {
        optional: true,
        isNumeric: true,
        errorMessage: "Invalid number of bathrooms"
    },
    areaSqMeters: {
        optional: true,
        isNumeric: true,
        errorMessage: "Invalid area in square meters"
    },
    priceIncludesTaxes: {
        optional: true,
        isBoolean: true,
        errorMessage: "Invalid value for priceIncludesTaxes"
    },
    smokingAllowed: {
        optional: true,
        isBoolean: true,
        errorMessage: "Invalid value for smokingAllowed"
    },
    latitude: {
        optional: true,
        isNumeric: true,
        errorMessage: "Invalid latitude"
    },
    longitude: {
        optional: true,
        isNumeric: true,
        errorMessage: "Invalid longitude"
    }
};

export default scrapedParsedDataSchema;
