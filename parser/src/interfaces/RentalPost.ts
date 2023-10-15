// shared

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

export interface RentalPost {
    postId: string;
    rawData: any;
    source: string;
    date: Date;
    images: string[];
    url?: string;
    authorUserId?: string;
    authorUsername?: string;
    authorUrl?: string;
    latitude?: number;
    longitude?: number;
    isRental: boolean;
    isForRent: boolean;
    rentalType?: RentalTypes;
    monthlyPrice?: number;
    securityDepositMonths?: number;
    zone?: string;
    description?: string;
    sexRestrictions?: SexRestrictions;
    occupationalRestrictions?: OccupationalRestrictions;
    lgbtFriendly?: boolean;
    furnished?: boolean;
    availabilityStartDate?: Date;
    availabilityEndDate?: Date;
    contractDurationMonths?: number;
    hasBalcony?: boolean;
    hasParking?: boolean;
    address?: string;
    floorNumber?: number;
    rooms?: number;
    bathrooms?: number;
    areaSqMeters?: number;
    priceIncludesTaxes?: boolean;
    smokingAllowed?: boolean;
    hasAirConditioning?: boolean;
    hasHeating?: boolean;
    hasElevator?: boolean;
}

export type RentalPostWithoutDescription = Omit<RentalPost, "description">;
