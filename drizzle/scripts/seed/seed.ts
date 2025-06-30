import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../../src/server/db/schemas';
import { globalBankSeedData } from './data/global-bank';
import { globalBankAccountSeedData } from './data/global-bank-account';

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set.');

const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema, casing: 'snake_case' });

/**
 * Main function to seed the database
 */
async function main() {
    console.log('Seeding database...');

    // Insert global banks
    console.log('Seeding global banks...');
    await db.insert(schema.globalBank).values(globalBankSeedData).onConflictDoNothing();

    // Insert global bank accounts
    console.log('Seeding global bank accounts...');
    await db
        .insert(schema.globalBankAccount)
        .values(globalBankAccountSeedData)
        .onConflictDoNothing();

    console.log('✅ Database seeding completed!');
    await client.end();
}

/**
 * Execute the main function to seed the database
 */
main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    });
