import "./db";

export const config = Object.freeze({
    TURNSTILE_URL: "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    orderByOptions: ["priceAsc", "priceDesc", "dateAsc", "dateDesc"] as const
});
