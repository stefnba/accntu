import * as schema from '@/db/schema';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

require('dotenv').config();

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const pool = new Pool({
    connectionString: DATABASE_URL
});

const db = drizzle(pool, { schema, logger: true });

const seedBanks = async () => {
    const banks = await db
        .insert(schema.bank)
        .values([
            {
                country: 'DE',
                name: 'Barclays'
            },
            {
                country: 'CH',
                name: 'UBS'
            }
        ])
        .returning();

    await Promise.all(
        banks.map(async (bank) => {
            return db.insert(schema.bankUploadAccounts).values([
                {
                    type: 'CREDIT_CARD',
                    bankId: bank.id
                },
                {
                    type: 'CURRENT',
                    bankId: bank.id
                }
            ]);
        })
    );
};

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
