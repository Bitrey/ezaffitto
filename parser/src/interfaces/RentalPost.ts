enum RentalType {
    SingleRoom = "singleRoom",
    DoubleRoom = "doubleRoom",
    Studio = "studio",
    Apartment = "apartment",
    House = "house",
    Other = "other"
}

enum SexRestrictions {
    Everyone = "everyone",
    Males = "males",
    Females = "females",
    Other = "other"
}

enum OccupationalRestrictions {
    Everyone = "everyone",
    Students = "students",
    Workers = "workers",
    Other = "other"
}

export interface RentalPost {
    isRental: boolean;
    isForRent: boolean;
    rentalType: RentalType;
    monthlyPrice: number | null;
    monthlyPricePerBed: number | null;
    securityDepositMonths: number | null;
    zone: string | null;
    description: string;
    sexRestrictions: SexRestrictions;
    occupationalRestrictions: OccupationalRestrictions;
    lgbtFriendly: boolean | null;
    furnished: boolean;
    availabilityStartDate?: Date;
    availabilityEndDate?: Date;
    contractDurationMonths?: number;
    hasBalcony: boolean;
    hasParking: boolean;
    address: string;
    floorNumber: number;
    rooms: number;
    bathrooms: number;
    areaSqMeters: number;
    priceIncludesTaxes: boolean;
    smokingAllowed: boolean | null;
}
