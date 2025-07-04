/**
 * PostgreSQL Query Demo using DuckDB PostgreSQL Extension
 *
 * This demo shows how to:
 * 1. Query PostgreSQL tables directly from DuckDB
 * 2. Join data between DuckDB and PostgreSQL
 * 3. Perform analytics on PostgreSQL data
 * 4. Use the bulk duplicate detection feature
 */

// import { getEnv } from '@/lib/env';
import { DuckDBCore } from '../core';
import type { DuckDBConfig } from '../types';

async function createPostgresQueryDemo() {
    console.log('🚀 Starting JSON Query Demo...\n');

    // Configuration - PostgreSQL extension auto-loads when postgres config is present
    const config: DuckDBConfig = {
        database: ':memory:',
    };

    const duckdb = new DuckDBCore(config);

    try {
        // Initialize DuckDB with PostgreSQL extension
        await duckdb.initialize();
        console.log('✅ DuckDB initialized\n');

        console.log('🔍 Querying array objects...');

        const result = await duckdb.queryArrayObjects(
            [
                { id: 1, name: 'John' },
                { id: 2, name: 'Jane' },
            ],
            'SELECT * FROM data'
        );
        console.log(result.rows);

        console.log('🔍 Querying array objects with temp table...');

        const resultTempTable = await duckdb.queryArrayObjectsTable(
            [
                { id: 1, name: 'John' },
                { id: 2, name: 'Jane' },
            ],
            'SELECT * FROM data'
        );
        console.log(resultTempTable.rows);
    } catch (error) {
        console.error('❌ Demo failed:', error);
    } finally {
        await duckdb.cleanup();
        console.log('\n🧹 Cleanup completed');
    }
}

createPostgresQueryDemo().catch(console.error);
