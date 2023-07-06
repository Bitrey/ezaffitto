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

export function isRentalPost(input: unknown): input is RentalPost {
    if (typeof input !== "object" || input === null) {
        return false;
    }

    const {
        isRental,
        isForRent,
        rentalType,
        monthlyPrice,
        monthlyPricePerBed,
        securityDepositMonths,
        zone,
        description,
        sexRestrictions,
        occupationalRestrictions,
        lgbtFriendly,
        furnished,
        availabilityStartDate,
        availabilityEndDate,
        contractDurationMonths,
        hasBalcony,
        hasParking,
        address,
        floorNumber,
        rooms,
        bathrooms,
        areaSqMeters,
        priceIncludesTaxes,
        smokingAllowed
    } = input as RentalPost;

    return (
        typeof isRental === "boolean" &&
        typeof isForRent === "boolean" &&
        Object.values(RentalType).includes(rentalType) &&
        (typeof monthlyPrice === "number" || monthlyPrice === null) &&
        (typeof monthlyPricePerBed === "number" ||
            monthlyPricePerBed === null) &&
        (typeof securityDepositMonths === "number" ||
            securityDepositMonths === null) &&
        (typeof zone === "string" || zone === null) &&
        typeof description === "string" &&
        Object.values(SexRestrictions).includes(sexRestrictions) &&
        Object.values(OccupationalRestrictions).includes(
            occupationalRestrictions
        ) &&
        (typeof lgbtFriendly === "boolean" || lgbtFriendly === null) &&
        typeof furnished === "boolean" &&
        (typeof availabilityStartDate === "undefined" ||
            availabilityStartDate instanceof Date) &&
        (typeof availabilityEndDate === "undefined" ||
            availabilityEndDate instanceof Date) &&
        (typeof contractDurationMonths === "number" ||
            typeof contractDurationMonths === "undefined") &&
        typeof hasBalcony === "boolean" &&
        typeof hasParking === "boolean" &&
        typeof address === "string" &&
        typeof floorNumber === "number" &&
        typeof rooms === "number" &&
        typeof bathrooms === "number" &&
        typeof areaSqMeters === "number" &&
        typeof priceIncludesTaxes === "boolean" &&
        (typeof smokingAllowed === "boolean" || smokingAllowed === null)
    );
}
