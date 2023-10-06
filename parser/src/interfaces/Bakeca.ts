// bakeca

export interface BakecaRoot {
    "@context": string;
    "@type": string[];
    url: string;
    identifier: Identifier;
    description?: string;
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
