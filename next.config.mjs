/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    experimental: {
        typedRoutes: true,
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            // Handle DuckDB native bindings for server-side only
            config.externals = config.externals || [];

            // Externalize the main DuckDB packages
            config.externals.push('@duckdb/node-api');
            config.externals.push('@duckdb/node-bindings');

            // Handle platform-specific bindings
            const platforms = [
                '@duckdb/node-bindings-darwin-arm64',
                '@duckdb/node-bindings-darwin-x64',
                '@duckdb/node-bindings-linux-arm64',
                '@duckdb/node-bindings-linux-x64',
                '@duckdb/node-bindings-win32-x64',
            ];

            platforms.forEach((platform) => {
                config.externals.push({
                    [platform]: `commonjs ${platform}`,
                    [`${platform}/duckdb.node`]: `commonjs ${platform}/duckdb.node`,
                });
            });
        } else {
            // For client-side, completely ignore DuckDB
            config.resolve.fallback = {
                ...config.resolve.fallback,
                '@duckdb/node-api': false,
                '@duckdb/node-bindings': false,
                '@duckdb/duckdb-wasm': false,
                duckdb: false,
            };
        }

        return config;
    },
};

export default nextConfig;
