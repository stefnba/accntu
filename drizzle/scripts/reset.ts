import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Import all feature schemas
import * as schemaImport from '../../src/server/db/tables';

// Handle both default and named exports
const schema = ('default' in schemaImport ? schemaImport.default : schemaImport) as Record<
    string,
    any
>;

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(DATABASE_URL);

const db = drizzle(client, { schema, logger: false });

async function reset() {
    console.log('🗑️ Emptying the entire database');

    // Get all table names from the combined schema
    const tableNames = Object.values(schema)
        .filter(
            (table: any) => table && typeof table === 'object' && table[Symbol.for('drizzle:Name')]
        )
        .map((table: any) => table[Symbol.for('drizzle:Name')]);

    if (tableNames.length === 0) {
        console.log('⚠️ No tables found in schema');
        return;
    }

    console.log(`🧨 Found ${tableNames.length} tables to drop:`, tableNames);

    // Drop tables in reverse dependency order to avoid foreign key conflicts
    const dropQueries = tableNames.map((tableName) =>
        sql.raw(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`)
    );

    console.log('🛜 Executing drop queries...');

    await db.transaction(async (tx) => {
        for (const query of dropQueries) {
            try {
                await tx.execute(query);
                console.log(`✅ Dropped table successfully`);
            } catch (error) {
                console.warn(`⚠️ Failed to drop table:`, error);
            }
        }
    });

    console.log('✅ Database reset completed');
    await client.end();
}

reset().catch((e) => {
    console.error('❌ Database reset failed:', e);
    process.exit(1);
});
