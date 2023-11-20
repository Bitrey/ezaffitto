import "./db";

export const config = Object.freeze({
    RECAPTCHA_URL: "https://www.google.com/recaptcha/api/siteverify",
    orderByOptions: ["priceAsc", "priceDesc", "dateAsc", "dateDesc"] as const
});
