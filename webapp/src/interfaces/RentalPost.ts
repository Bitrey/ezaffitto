export interface PostMetadata {
    postId: string;
    rawData: string;
    source: string;
    date: Date;
    images: string[];
    url?: string;
    authorUserId?: string;
    authorUsername?: string;
    authorUrl?: string;
    latitude?: number;
    longitude?: number;
}

export interface ParsedData {
    isRental: boolean;
    isForRent: boolean;
    description?: string;
    rentalType?: string;
    monthlyPrice?: number;
    monthlyPricePerBed?: number;
    securityDepositMonths?: number;
    zone?: string;
    sexRestrictions?: string;
    occupationalRestrictions?: string;
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
}

export interface Timestamps {
    createdAt: Date;
    updatedAt: Date;
}

export interface RentalPost extends PostMetadata, ParsedData, Timestamps {}

export interface RentalPostJSONified
    extends Omit<RentalPost, "date" | "createdAt" | "updatedAt"> {
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}
