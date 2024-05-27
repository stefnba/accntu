import * as schema from '@db/schema';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { seedBanks } from './banks';

require('dotenv').config();

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const pool = new Pool({
    connectionString: DATABASE_URL
});

const db = drizzle(pool, { schema, logger: true });

async function main() {
    console.log('Seeding database...');

    await seedBanks();

    console.log('✅ Database seeding completed!');
    return;
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
