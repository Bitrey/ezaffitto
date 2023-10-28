export interface ImmobiliareRoot {
    count: number;
    totalAds: number;
    isResultsLimitReached: boolean;
    results: Result[];
    breadcrumbs: Breadcrumb[];
    agencies: any[];
    seoData: SeoData;
    relatedSearches: RelatedSearches;
    suggestedSearchData: SuggestedSearchData;
    currentPage: number;
    maxPages: number;
}

export interface Result {
    realEstate: RealEstate;
    seo: Seo;
    idGeoHash: string;
}

export interface RealEstate {
    dataType: string;
    advertiser: Advertiser;
    contract: string;
    id: number;
    isNew: boolean;
    luxury: boolean;
    price: Price;
    properties: Property[];
    title: string;
    type: string;
    typology: Typology2;
    visibility?: string;
    hasMainProperty: boolean;
    isProjectLike: boolean;
}

export interface Advertiser {
    agency?: Agency;
    hasCallNumbers: boolean;
    supervisor?: Supervisor;
}

export interface Agency {
    id: number;
    type: string;
    phones: Phone[];
    isPaid: boolean;
    guaranteed: boolean;
    showAgentPhone: boolean;
    label: string;
    agencyUrl: string;
    imageUrls: ImageUrls;
    displayName: string;
    bookableVisit: BookableVisit;
}

export interface Phone {
    type: string;
    value: string;
}

export interface ImageUrls {
    small: string;
    large: string;
}

export interface BookableVisit {
    isVisitBookable: boolean;
    virtualVisitEnabled: boolean;
}

export interface Supervisor {
    type: string;
    imageGender: string;
    phones: any[];
    label: string;
    imageType: string;
}

export interface Price {
    visible: boolean;
    value: number;
    formattedValue: string;
    priceRange: string;
    loweredPrice?: LoweredPrice;
}

export interface LoweredPrice {
    originalPrice: string;
    currentPrice: string;
    discountPercentage: string;
    priceDecreasedBy: string;
    passedDays: number;
    date: string;
    typologiesCount: number;
}

export interface Property {
    income: boolean;
    multimedia: Multimedia;
    bathrooms?: string;
    ga4Bathrooms: string;
    floor: Floor;
    floors: string;
    price: Price2;
    rooms?: string;
    hasElevators: boolean;
    surface: string;
    surfaceValue: string;
    typology: Typology;
    typologyV2: TypologyV2;
    typologyGA4Translation: string;
    ga4features: string[];
    caption?: string;
    category: Category;
    description: string;
    features: string[];
    photo: Photo2;
    location: Location;
    bedRoomsNumber?: string;
    energy?: Energy;
    ga4Condition?: string;
    condition?: string;
}

export interface Multimedia {
    photos: Photo[];
    virtualTours: any[];
    hasMultimedia: boolean;
}

export interface Photo {
    id: number;
    caption: string;
    urls: Urls;
}

export interface Urls {
    small: string;
}

export interface Floor {
    abbreviation?: string;
    value: string;
    ga4FloorValue: string;
}

export interface Price2 {
    visible: boolean;
    value: number;
    formattedValue: string;
    priceRange: string;
    loweredPrice?: LoweredPrice2;
}

export interface LoweredPrice2 {
    originalPrice: string;
    currentPrice: string;
    discountPercentage: string;
    priceDecreasedBy: string;
    passedDays: number;
    date: string;
    typologiesCount: number;
}

export interface Typology {
    id: number;
    name: string;
}

export interface TypologyV2 {
    id: number;
    name: string;
}

export interface Category {
    id: number;
    name: string;
}

export interface Photo2 {
    id: number;
    caption: string;
    urls: Urls2;
}

export interface Urls2 {
    thumb: string;
    small: string;
    medium: string;
    large: string;
}

export interface Location {
    latitude: number;
    longitude: number;
    marker: string;
    region: string;
    province: string;
    macrozone: string;
    microzone: string;
    city: string;
    nation: Nation;
}

export interface Nation {
    id: string;
    name: string;
    keyurl: string;
}

export interface Energy {
    zeroEnergyBuilding: boolean;
    heatingType: string;
    GA4Heating: string;
}

export interface Typology2 {
    id: number;
    name: string;
}

export interface Seo {
    anchor: string;
    title: string;
    metaTitle: string;
    url: string;
}

export interface Breadcrumb {
    label: string;
    link?: Link;
    type?: string;
    items?: Item[];
}

export interface Link {
    url: string;
}

export interface Item {
    label: string;
    title: string;
    link: Link2;
}

export interface Link2 {
    url: string;
    follow: boolean;
    current: boolean;
}

export interface SeoData {
    title: string;
    subtitle: string;
    description: string;
    searchName: string;
    facebookSettings: FacebookSettings;
    robots: any;
    alternate: Alternate[];
    canonical: string;
    appleItunesApp: AppleItunesApp;
    prevPage: any;
    nextPage: string;
}

export interface FacebookSettings {
    prefix: string;
    title: string;
    description: string;
    image: string;
    subtitle: string;
}

export interface Alternate {
    rel: string;
    hreflang: string;
    href: string;
}

export interface AppleItunesApp {
    appId: number;
    affiliateData: string;
    appArgument: string;
}

export interface RelatedSearches {
    title: string;
    data: any[];
}

export interface SuggestedSearchData {
    token: string;
    verticaleSito: string;
}
