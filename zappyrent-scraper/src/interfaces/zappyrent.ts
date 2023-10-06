// zappyrent
export interface ZappyRentRoot {
    error: boolean;
    message: string;
    data: Data;
}

export interface Data {
    properties: Property[];
    pagination: Pagination;
    city: City;
    maxPrice: number;
}

export interface Property {
    id: number;
    name: string;
    city: string;
    city_of_reference: string;
    province: string;
    type: string;
    latitude: string;
    longitude: string;
    street: string;
    street_number: string;
    no_of_beds?: string;
    services: string[];
    furniture: string[];
    floor: string;
    building_floors: any;
    size?: string;
    bathrooms: string;
    currency: string;
    cap: string;
    matterport_link?: string;
    price: number;
    smoking: any;
    pets?: string;
    total_house_mates: any;
    firstAvailablePeriods: FirstAvailablePeriods;
    total_bedrooms?: number;
    bedrooms?: number;
    canVisit: boolean;
    images: Image[];
    created_at: string;
    updated_at: string;
    available_within_7: number;
    extra_fee_percentage: number;
    new_listing: boolean;
}

export interface FirstAvailablePeriods {
    start_date: string;
    end_date: any;
}

export interface Image {
    index: number;
    url: string;
    urls?: Urls;
}

export interface Urls {
    "500": string;
    "1200"?: string;
    "3000"?: string;
    "710"?: string;
    "720"?: string;
    "1052"?: string;
}

export interface Pagination {
    size: string;
    total: number;
    current: number;
    from: number;
    to: number;
    lastPage: number;
}

export interface City {
    name: string;
    latitude: string;
    longitude: string;
}
