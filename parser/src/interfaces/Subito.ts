export interface Root {
    count_all: number;
    lines: number;
    start: number;
    filters: Filters;
    checknew: string;
    ads: Ad[];
}

export interface Filters {
    c: string;
    ci: string;
    lim: string;
    qso: string;
    r: string;
    shp: string;
    sort: string;
    start: string;
    t: string;
    to: string;
    urg: string;
}

export interface Ad {
    urn: string;
    type: Type;
    category: Category;
    subject: string;
    body: string;
    dates: Dates;
    images: Image[];
    images_360: any[];
    features: Feature[];
    advertiser: Advertiser;
    geo: Geo;
    urls: Urls;
}

export interface Type {
    key: string;
    value: string;
    weight: number;
}

export interface Category {
    key: string;
    value: string;
    friendly_name: string;
    macrocategory_id: string;
    weight: number;
}

export interface Dates {
    display: string;
    expiration: string;
}

export interface Image {
    uri: string;
    base_url: string;
    cdn_base_url: string;
    scale: Scale[];
}

export interface Scale {
    uri: string;
    secureuri: string;
    size: string;
}

export interface Feature {
    type: string;
    uri: string;
    label: string;
    values: Value[];
}

export interface Value {
    key: string;
    value: string;
    weight?: number;
}

export interface Advertiser {
    user_id: string;
    name: string;
    phone?: string;
    company: boolean;
    type: number;
    shop_id?: number;
    shop_name?: string;
}

export interface Geo {
    region: Region;
    city: City;
    town: Town;
    uri: string;
    label: string;
    type: string;
    map?: Map;
}

export interface Region {
    key: string;
    uri: string;
    value: string;
    friendly_name: string;
    label: string;
    level: number;
    neighbors: string;
}

export interface City {
    key: string;
    uri: string;
    value: string;
    label: string;
    friendly_name: string;
    short_name: string;
    level: number;
    istat: string;
    region_id: string;
}

export interface Town {
    key: string;
    uri: string;
    value: string;
    label: string;
    level: number;
    istat: string;
    region_id: string;
    city_id: string;
    has_zone: boolean;
    friendly_name: string;
}

export interface Map {
    address: string;
    latitude: string;
    longitude: string;
    zoom: string;
}

export interface Urls {
    default: string;
    mobile: string;
}
