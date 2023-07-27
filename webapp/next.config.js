/** @type {import('next').NextConfig} */
const nextConfig = {
    i18n: {
        locales: ["it"],
        defaultLocale: "it"
    },
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
