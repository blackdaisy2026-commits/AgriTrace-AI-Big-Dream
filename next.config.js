/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'res.cloudinary.com' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
        ],
    },
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
        };

        // Fix for wagmi/connectors build error: "Can't resolve 'porto/internal'"
        if (!config.externals) {
            config.externals = [];
        }
        if (Array.isArray(config.externals)) {
            config.externals.push(
                'porto/internal',
                '@base-org/account',
                '@coinbase/wallet-sdk',
                'pino-pretty',
                'lokijs',
                'encoding'
            );
        }

        return config;
    },
};

module.exports = nextConfig;
