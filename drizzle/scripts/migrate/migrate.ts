import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set.');

const client = postgres(DATABASE_URL);
const db = drizzle(client, {
    casing: 'snake_case',
});

async function main() {
    console.log('Running database migrations...');
    await migrate(db, { migrationsFolder: 'drizzle/migrations' });
    console.log('✅ Database migrations completed!');
    await client.end();
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    });
