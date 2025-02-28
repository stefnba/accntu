import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schemas';

// Get database connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
}

// Create connection with connection pooling
const client = postgres(connectionString, {
    max: 10, // Maximum number of connections in the pool
    idle_timeout: 30, // Max seconds a connection can be idle before being removed
    connect_timeout: 10, // Max seconds to wait for a connection
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export schema
export { schema };
