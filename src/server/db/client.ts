import { getEnv } from '@/lib/env';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dbTable from './tables';

// Get database connection string from validated environment variables
const { DATABASE_URL } = getEnv();

// Create connection with connection pooling
const client = postgres(DATABASE_URL, {
    max: 10, // Maximum number of connections in the pool
    idle_timeout: 30, // Max seconds a connection can be idle before being removed
    connect_timeout: 10, // Max seconds to wait for a connection
});

// Create drizzle instance
export const db = drizzle(client, { schema: dbTable, casing: 'snake_case' });

/**
 * Checks the database connection by executing a simple query.
 * Throws an error if the connection fails. This is intended to be called at server startup.
 */
export async function checkDbConnection() {
    try {
        console.log('🔍 Checking database connection...');
        await db.execute(sql`SELECT 1`);
        console.log('✅ Database connection successful.');
    } catch (error) {
        console.error('❌ Database connection failed:');
        // console.error(error);
        throw new Error(
            '\n❌❌❌ Could not connect to the database.Please check your connection string and ensure the database server is running.'
        );
    }
}
