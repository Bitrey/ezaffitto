import {
    prop,
    getModelForClass,
    modelOptions,
    Severity
} from "@typegoose/typegoose";
import { config } from "../config";
import mongoose from "mongoose";

export enum RentalTypes {
    SINGLE_ROOM = "singleRoom",
    DOUBLE_ROOM = "doubleRoom",
    STUDIO = "studio",
    APARTMENT = "apartment",
    HOUSE = "house",
    OTHER = "other"
}

export enum SexRestrictions {
    EVERYONE = "everyone",
    MALES = "males",
    FEMALES = "females",
    OTHER = "other"
}

export enum OccupationalRestrictions {
    EVERYONE = "everyone",
    STUDENTS = "students",
    WORKERS = "workers",
    OTHER = "other"
}

@modelOptions({
    schemaOptions: { timestamps: true },
    options: { customName: "posts" }
})
export class RentalPostClass {
    @prop({ required: true })
    postId!: string;

    @prop({
        required: true,
        allowMixed: Severity.ALLOW,
        type: () => mongoose.Schema.Types.Mixed
    })
    public rawData!: any;

    // Metadata
    @prop({ required: true, enum: config.SCRAPER_TYPES })
    source!: string;

    @prop({ required: true })
    date!: Date;

    @prop({ required: true, type: () => [String], default: [] })
    images!: string[];

    @prop({ required: false })
    url?: string;

    @prop({ required: false })
    authorUserId?: string;

    @prop({ required: false })
    authorUsername?: string;

    @prop({ required: false })
    authorUrl?: string;

    // Parsed data

    @prop({ required: false })
    latitude?: number;

    @prop({ required: false })
    longitude?: number;

    @prop({ required: true })
    isRental!: boolean;

    @prop({ required: true })
    isForRent!: boolean;

    @prop({ required: false, enum: RentalTypes })
    rentalType?: RentalTypes;

    @prop({ required: false })
    monthlyPrice?: number;

    @prop({ required: false })
    securityDepositMonths?: number;

    @prop({ required: false })
    zone?: string;

    @prop({ required: false })
    rawDescription?: string;

    @prop({ required: false })
    description?: string;

    @prop({ required: false, enum: SexRestrictions })
    sexRestrictions?: SexRestrictions;

    @prop({ required: false, enum: OccupationalRestrictions })
    occupationalRestrictions?: OccupationalRestrictions;

    @prop({ required: false })
    lgbtFriendly?: boolean;

    @prop({ required: false })
    furnished?: boolean;

    @prop({ required: false })
    availabilityStartDate?: Date;

    @prop({ required: false })
    availabilityEndDate?: Date;

    @prop({ required: false })
    contractDurationMonths?: number;

    @prop({ required: false })
    hasBalcony?: boolean;

    @prop({ required: false })
    hasParking?: boolean;

    @prop({ required: false })
    address?: string;

    @prop({ required: false })
    floorNumber?: number;

    @prop({ required: false })
    rooms?: number;

    @prop({ required: false })
    bathrooms?: number;

    @prop({ required: false })
    areaSqMeters?: number;

    @prop({ required: false })
    priceIncludesTaxes?: boolean;

    @prop({ required: false })
    smokingAllowed?: boolean;

    @prop({ required: false })
    hasAirConditioning?: boolean;

    @prop({ required: false })
    hasHeating?: boolean;

    @prop({ required: false })
    hasElevator?: boolean;
}

const RentalPost = getModelForClass(RentalPostClass);

export default RentalPost;
