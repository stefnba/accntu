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
    console.log('🚀 Starting PostgreSQL Query Demo...\n');

    // Configuration - PostgreSQL extension auto-loads when postgres config is present
    const config: DuckDBConfig = {
        database: ':memory:',
        postgres: {
            connectionString: process.env.DATABASE_URL || '',
            connectionLimit: 5,
            timeout: 30000,

            // DuckDB PostgreSQL extension specific options
            alias: 'main_db', // Custom database alias instead of 'pg_db'
            schema: 'public', // Only attach 'public' schema
            readOnly: false, // Allow read/write operations
            useSecret: false, // Use connection string directly
        },
    };

    const duckdb = new DuckDBCore(config);

    try {
        // Initialize DuckDB with PostgreSQL extension
        await duckdb.initialize();
        console.log('✅ DuckDB initialized with PostgreSQL extension\n');

        // Get the configured PostgreSQL alias
        const pgAlias = duckdb.getPostgresAlias();
        console.log(`📋 PostgreSQL attached as: ${pgAlias}`);

        const result = await duckdb.query(`
            SELECT * FROM ${pgAlias}.global_bank_account LIMIT 5
        `);
        console.log(
            'Sample global bank accounts:',
            result.rows.length > 0 ? result.rows : 'No data found'
        );
    } catch (error) {
        console.error('❌ Demo failed:', error);
    } finally {
        await duckdb.cleanup();
        console.log('\n🧹 Cleanup completed');
    }
}

createPostgresQueryDemo().catch(console.error);
