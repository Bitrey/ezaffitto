import { EzaffittoCity } from "../interfaces/RentalPost";

export const config = Object.freeze({
    languages: ["en", "it"],
    captchaV3SiteKey: "6LdjlRUpAAAAABkQdf4BNEdXAlKeANcbNQnpYTT5",
    ga4Token: "G-MTGX0JZEFL",
    infoEmail: "info@ezaffitto.com",
    minMaxPrice: 100,
    postDynamicFeatures: [
        "rentalType",
        "monthlyPrice",
        "address",
        "floorNumber",
        "securityDepositMonths",
        "zone",
        "sexRestrictions",
        "occupationalRestrictions",
        "lgbtFriendly",
        "furnished",
        "availabilityStartDate",
        "availabilityEndDate",
        "contractDurationMonths",
        "hasBalcony",
        "hasParking",
        "rooms",
        "bathrooms",
        "areaSqMeters",
        "priceIncludesTaxes",
        "smokingAllowed",
        "hasAirConditioning",
        "hasHeating",
        "hasElevator"
    ],
    enabledCities: ["bologna", "milano"] as Readonly<EzaffittoCity[]>,
    bitreyUrl: "https://www.bitrey.it",
    maxUrl: "https://www.ozolin.net/"
});

type CityCoords = {
    [key in EzaffittoCity]: [lat: number, lng: number];
};
export const cityCoords: Readonly<CityCoords> = Object.freeze({
    bologna: [44.494887, 11.342616],
    milano: [45.464664, 9.18854],
    roma: [41.902782, 12.496366],
    torino: [45.070312, 7.686856],
    firenze: [43.769871, 11.255576],
    napoli: [40.851775, 14.268124],
    padova: [45.406435, 11.876761],
    genova: [44.40564, 8.946256]
});

export const gaEvents = {
    findPosts: {
        category: "Posts",
        action: "find"
    },
    findOnePost: {
        category: "Posts",
        action: "findOne"
    }
};

export const rentalTypeOptions = Object.freeze([
    { value: "singleRoom", label: "rentalType.singleRoom" },
    { value: "doubleRoom", label: "rentalType.doubleRoom" },
    { value: "studio", label: "rentalType.studio" },
    { value: "apartment", label: "rentalType.apartment" },
    { value: "house", label: "rentalType.house" },
    { value: "other", label: "rentalType.other" }
]);
