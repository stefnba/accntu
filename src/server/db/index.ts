import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schemas';
import { getEnv } from '@/lib/env';

// Get database connection string from validated environment variables
const { DATABASE_URL } = getEnv();

// Create connection with connection pooling
const client = postgres(DATABASE_URL, {
    max: 10, // Maximum number of connections in the pool
    idle_timeout: 30, // Max seconds a connection can be idle before being removed
    connect_timeout: 10, // Max seconds to wait for a connection
});

// Create drizzle instance
export const db = drizzle(client, { schema, casing: 'snake_case' });

// Export schema
export { schema };
