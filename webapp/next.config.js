const { i18n } = require("./next-i18next.config");

/** @type {import('next').NextConfig} */
const nextConfig = {
    i18n,
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: "http://db-api:5500/api/:path*"
            }
        ];
    }
};

module.exports = nextConfig;
