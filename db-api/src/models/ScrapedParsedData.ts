import {
    prop,
    getModelForClass,
    Ref,
    modelOptions
} from "@typegoose/typegoose";

enum RentalType {
    SINGLE_ROOM = "singleRoom",
    DOUBLE_ROOM = "doubleRoom",
    STUDIO = "studio",
    APARTMENT = "apartment",
    HOUSE = "house",
    OTHER = "other"
}

export const rentalTypes = Object.values(RentalType);

enum SexRestrictions {
    EVERYONE = "everyone",
    MALES = "males",
    FEMALES = "females",
    OTHER = "other"
}

export const sexRestrictions = Object.values(SexRestrictions);

enum OccupationalRestrictions {
    EVERYONE = "everyone",
    STUDENTS = "students",
    WORKERS = "workers",
    OTHER = "other"
}

export const occupationalRestrictions = Object.values(OccupationalRestrictions);

@modelOptions({
    schemaOptions: { timestamps: true },
    options: { customName: "scrapedparseddatas" }
})
export class ScrapedParsedDataClass {
    @prop({ required: true })
    public isRental!: boolean;

    @prop({ required: true })
    public isForRent!: boolean;

    @prop({ required: true })
    public description!: string;

    @prop({ required: false, enum: RentalType })
    public rentalType?: RentalType;

    @prop({ required: true })
    public sourceType!: string;

    @prop({ type: String })
    public pictures?: string[];

    @prop({ required: true })
    public url!: string;

    @prop({ ref: () => "ScrapedRawData" })
    public rawData?: Ref<"ScrapedRawData">;

    @prop({ required: false })
    public monthlyPrice?: number;

    @prop({ required: false })
    public monthlyPricePerBed?: number;

    @prop({ required: false })
    public securityDepositMonths?: number;

    @prop({ required: false })
    public zone?: string;

    @prop({ required: false, enum: SexRestrictions })
    public sexRestrictions?: SexRestrictions;

    @prop({ required: false, enum: OccupationalRestrictions })
    public occupationalRestrictions?: OccupationalRestrictions;

    @prop({ required: false })
    public lgbtFriendly?: boolean;

    @prop({ required: false })
    public furnished?: boolean;

    @prop({ required: false })
    public availabilityStartDate?: Date;

    @prop({ required: false })
    public availabilityEndDate?: Date;

    @prop({ required: false })
    public contractDurationMonths?: number;

    @prop({ required: false })
    public hasBalcony?: boolean;

    @prop({ required: false })
    public hasParking?: boolean;

    @prop({ required: false })
    public address?: string;

    @prop({ required: false })
    public floorNumber?: number;

    @prop({ required: false })
    public rooms?: number;

    @prop({ required: false })
    public bathrooms?: number;

    @prop({ required: false })
    public areaSqMeters?: number;

    @prop({ required: false })
    public priceIncludesTaxes?: boolean;

    @prop({ required: false })
    public smokingAllowed?: boolean;

    @prop({ required: false })
    public latitude?: number;

    @prop({ required: false })
    public longitude?: number;
}

const ScrapedParsedData = getModelForClass(ScrapedParsedDataClass);

export default ScrapedParsedData;
