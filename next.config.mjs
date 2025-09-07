/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    typedRoutes: true,
    experimental: {},
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
            // For client-side, completely ignore DuckDB and Node.js modules
            config.resolve.fallback = {
                ...config.resolve.fallback,
                '@duckdb/node-api': false,
                '@duckdb/node-bindings': false,
                '@duckdb/duckdb-wasm': false,
                duckdb: false,
                // Node.js built-in modules (for postgres package)
                net: false,
                tls: false,
                crypto: false,
                stream: false,
                util: false,
                url: false,
                querystring: false,
                path: false,
                os: false,
                fs: false,
                perf_hooks: false,
                // Postgres package
                postgres: false,
            };
        }

        // Suppress Hono color.js warnings
        config.ignoreWarnings = [
            ...(config.ignoreWarnings || []),
            {
                module: /node_modules\/hono\/dist\/utils\/color\.js/,
                message: /Critical dependency: the request of a dependency is an expression/,
            },
        ];

        return config;
    },
};

export default nextConfig;
