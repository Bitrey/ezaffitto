import { prop, getModelForClass, Ref } from "@typegoose/typegoose";

enum RentalType {
    SINGLE_ROOM = "singleRoom",
    DOUBLE_ROOM = "doubleRoom",
    STUDIO = "studio",
    APARTMENT = "apartment",
    HOUSE = "house",
    OTHER = "other"
}

enum SexRestrictions {
    EVERYONE = "everyone",
    MALES = "males",
    FEMALES = "females",
    OTHER = "other"
}

enum OccupationalRestrictions {
    EVERYONE = "everyone",
    STUDENTS = "students",
    WORKERS = "workers",
    OTHER = "other"
}

class RentalPost {
    @prop({ required: true })
    public isRental!: boolean;

    @prop({ required: true })
    public isForRent!: boolean;

    @prop({ required: true, enum: RentalType })
    public rentalType!: RentalType;

    @prop({ required: true })
    public monthlyPrice!: number;

    @prop()
    public monthlyPricePerBed?: number;

    @prop()
    public securityDepositMonths?: number;

    @prop({ required: true })
    public description!: string;

    @prop({ required: true, enum: SexRestrictions })
    public sexRestrictions!: SexRestrictions;

    @prop({ required: true, enum: OccupationalRestrictions })
    public occupationalRestrictions!: OccupationalRestrictions;

    @prop()
    public lgbtFriendly?: boolean;

    @prop({ required: true })
    public furnished!: boolean;

    @prop()
    public availabilityStartDate?: Date;

    @prop()
    public availabilityEndDate?: Date;

    @prop({ required: true })
    public contractDurationMonths!: number;

    @prop({ required: true })
    public hasBalcony!: boolean;

    @prop({ required: true })
    public hasParking!: boolean;

    @prop({ required: true })
    public address!: string;

    @prop({ required: true })
    public floorNumber!: number;

    @prop({ required: true })
    public rooms!: number;

    @prop({ required: true })
    public bathrooms!: number;

    @prop({ required: true })
    public areaSqMeters!: number;

    @prop({ required: true })
    public priceIncludesTaxes!: boolean;

    @prop()
    public smokingAllowed?: boolean;

    @prop()
    public zone?: string;

    @prop()
    public latitude?: number;

    @prop()
    public longitude?: number;

    @prop({ default: Date.now })
    public createdAt?: Date;

    @prop({ default: Date.now })
    public updatedAt?: Date;

    @prop({ required: true })
    public sourceType!: string;

    @prop({ type: String })
    public pictures?: string[];

    @prop({ required: true })
    public url!: string;

    @prop({ ref: () => "ScrapedRawData" })
    public rawData?: Ref<"ScrapedRawData">;
}

const RentalPostModel = getModelForClass(RentalPost);

export { RentalPost, RentalPostModel };
