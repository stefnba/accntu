// import { db } from '@db';
import * as schema from '@db/schema';
import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

require('dotenv').config();

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const pool = new Pool({
    connectionString: DATABASE_URL
});

const db = drizzle(pool, { schema, logger: false });

async function reset() {
    const tableSchema = db._.schema;
    if (!tableSchema) {
        throw new Error('No table schema found');
    }

    console.log('🗑️ Emptying the entire database');
    const queries = Object.values(tableSchema).map((table) => {
        console.log(`🧨 Preparing delete query for table: ${table.dbName}`);
        return sql.raw(`DROP TABLE IF EXISTS "${table.dbName}" CASCADE;`);
    });

    console.log('🛜 Sending delete queries');

    await db.transaction(async (tx) => {
        await Promise.all(
            queries.map(async (query) => {
                if (query) await tx.execute(query);
            })
        );
    });

    console.log('✅ Database emptied');
}

reset().catch((e) => {
    console.error(e);
});
