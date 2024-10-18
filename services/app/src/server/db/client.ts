import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';

const { DATABASE_URL } = process.env;

const pool = new Pool({
    connectionString: DATABASE_URL
});

export const db = drizzle(pool, { schema, logger: false });
export { schema };
