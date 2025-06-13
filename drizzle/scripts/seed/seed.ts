import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import fs from 'fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_SQL_DIR = path.join(__dirname, 'sql');

async function readSQLFiles(dir: string) {
    console.log(`Reading seed files from '${dir}'`);

    const files = await fs.readdir(dir);
    const sqlFiles = files.filter((file) => file.endsWith('.sql'));
    const sqlContents = await Promise.all(
        sqlFiles.sort().map(async (file) => {
            console.log(`Reading seed file '${file}'`);
            const filePath = path.join(dir, file);
            const query = await fs.readFile(filePath, 'utf-8');
            return {
                file,
                query,
            };
        })
    );
    return sqlContents;
}

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set.');

const client = postgres(DATABASE_URL);
const db = drizzle(client, {
    casing: 'snake_case',
});

async function main() {
    console.log('Seeding database...');

    const seedQueries = await readSQLFiles(SEED_SQL_DIR);

    await Promise.all(
        seedQueries.map(async ({ file, query }) => {
            console.log(`Executing seed query from file '${file}'`);
            await db.execute(sql.raw(query));
        })
    );

    console.log('✅ Database seeding completed!');
    await client.end();
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    });
