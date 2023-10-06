// bakeca

export interface BakecaRoot {
    "@context": string;
    "@type": string[];
    url: string;
    identifier: Identifier;
    description: string;
    name: string;
    image?: string;
    productID: string;
    category: string;
    additionalType: string;
    offers: Offers;
    address: Address;
    geo: Geo;
}

export interface Identifier {
    "@type": string;
    name: string;
    value: string;
}

export interface Offers {
    "@type": string;
    businessFunction: string;
    seller: Seller;
}

export interface Seller {
    "@type": string;
}

export interface Address {
    "@type": string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: AddressCountry;
}

export interface AddressCountry {
    "@type": string;
    name: string;
}

export interface Geo {
    "@type": string;
    latitude: number;
    longitude: number;
}

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
    rawDescription?: string;
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

// end shared

// export interface ScrapedParsedData {
//     postId: string;
//     post: ParsedData;
// }

export interface RentalPostEventEmitter {
    on(event: "bakecaPost", listener: (data: RentalPost) => void): this;
    emit(event: "bakecaPost", data: RentalPost): boolean;
}
