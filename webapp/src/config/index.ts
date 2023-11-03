export const config = Object.freeze({
    languages: ["en", "it"],
    turnstileSiteKey: "0x4AAAAAAALPWjAvPc2W_e1h",
    ga4Token: "G-MTGX0JZEFL",
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
    ]
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
