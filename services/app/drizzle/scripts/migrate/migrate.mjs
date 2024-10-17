import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

const { Pool } = pg;

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set.');

const pool = new Pool({
    connectionString: DATABASE_URL
});
export const db = drizzle(pool);

async function main() {
    // console.log('Running database migrations...');
    await migrate(db, { migrationsFolder: 'drizzle/migrations' });
    // console.log('✅ Database migrations completed!');
    return;
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
