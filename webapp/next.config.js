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
                destination: "http://0.0.0.0:5500/api/:path*"
            }
        ];
    }
};

module.exports = nextConfig;
