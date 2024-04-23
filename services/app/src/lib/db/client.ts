import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const pool = new Pool({
    connectionString: DATABASE_URL
});

export const db = drizzle(pool, { schema, logger: true });
export { schema };
