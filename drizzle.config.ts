import { defineConfig } from 'drizzle-kit';
const { DATABASE_URL } = process.env;

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set.');

export default defineConfig({
    out: './drizzle',
    schema: './src/server/db/schemas',
    dialect: 'postgresql',
    dbCredentials: {
        url: DATABASE_URL,
    },
});
