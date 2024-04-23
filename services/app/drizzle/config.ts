import type { Config } from 'drizzle-kit';

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set.');

export default {
    schema: './src/lib/db/schema.ts',
    out: './drizzle/migrations',
    driver: 'pg',
    dbCredentials: {
        connectionString: DATABASE_URL
    },
    introspect: {
        casing: 'camel'
    }
} satisfies Config;
