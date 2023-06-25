export interface RentalPost {
    isRental: boolean; // true if the post is about a rental
    isForRent: boolean; // true if the property is for rent and not for sale
    rentalType:
        | "singleRoom"
        | "doubleRoom"
        | "studio"
        | "apartment"
        | "house"
        | "other"; // enum: rental type options
    monthlyPrice: number | null; // monthly rent cost, converted if price is per day or week
    monthlyPricePerBed: number | null; // monthly rent cost, converted if price is per day or week
    sexRestrictions: "everyone" | "males" |  "females" | "other",
    smokingAllowed: boolean | null
    area: string | null;
    description: string; // 200-500 characters, professionally written in Italian, no personal references
    targetRestrictions:
        | "everyone"
        | "males"
        | "females"
        | "students"
        | "workers"
        | "other"; // enum: target restrictions options
    furnished: boolean;
    availabilityStartDate: Date | null; // start date if specified
    availabilityEndDate: Date | null; // end date if specified
    contractDuration: string;
    hasBalcony: boolean;
    hasParking: boolean;
    internetIncluded: boolean;
}
