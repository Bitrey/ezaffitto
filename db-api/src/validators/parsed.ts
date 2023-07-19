import { Schema } from "express-validator";
import {
    occupationalRestrictions,
    rentalTypes,
    sexRestrictions
} from "../models/ScrapedParsedData";

const scrapedParsedDataSchema: Schema = {
    isRental: {
        isBoolean: true
    },
    isForRent: {
        isBoolean: true
    },
    description: {
        isString: true
    },
    rentalType: {
        optional: true,
        isIn: {
            options: [Object.values(rentalTypes)]
        }
    },
    postId: {
        isString: true
    },
    source: {
        isString: true
    },
    pictures: {
        optional: true,
        isArray: true,
        custom: {
            options: value =>
                Array.isArray(value) &&
                value.every(item => typeof item === "string")
        }
    },
    url: {
        isURL: {}
    },
    rawData: {
        optional: true,
        isMongoId: true
    },
    monthlyPrice: {
        optional: true,
        isNumeric: true
    },
    monthlyPricePerBed: {
        optional: true,
        isNumeric: true
    },
    securityDepositMonths: {
        optional: true,
        isNumeric: true
    },
    zone: {
        optional: true,
        isString: true
    },
    sexRestrictions: {
        optional: true,
        isIn: {
            options: [Object.values(sexRestrictions)]
        }
    },
    occupationalRestrictions: {
        optional: true,
        isIn: {
            options: [Object.values(occupationalRestrictions)]
        }
    },
    lgbtFriendly: {
        optional: true,
        isBoolean: true
    },
    furnished: {
        optional: true,
        isBoolean: true
    },
    availabilityStartDate: {
        optional: true,
        isISO8601: true,
        toDate: true
    },
    availabilityEndDate: {
        optional: true,
        isISO8601: true,
        toDate: true
    },
    contractDurationMonths: {
        optional: true,
        isNumeric: true
    },
    hasBalcony: {
        optional: true,
        isBoolean: true
    },
    hasParking: {
        optional: true,
        isBoolean: true
    },
    address: {
        optional: true,
        isString: true
    },
    floorNumber: {
        optional: true,
        isNumeric: true
    },
    rooms: {
        optional: true,
        isNumeric: true
    },
    bathrooms: {
        optional: true,
        isNumeric: true
    },
    areaSqMeters: {
        optional: true,
        isNumeric: true
    },
    priceIncludesTaxes: {
        optional: true,
        isBoolean: true
    },
    smokingAllowed: {
        optional: true,
        isBoolean: true
    },
    latitude: {
        optional: true,
        isNumeric: true
    },
    longitude: {
        optional: true,
        isNumeric: true
    }
};

export default scrapedParsedDataSchema;
