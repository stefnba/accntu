import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schemas';

// Get database connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
}

// Create connection
const client = postgres(connectionString);

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export schema
export { schema };
