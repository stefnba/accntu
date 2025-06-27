import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { DuckDBManager } from '../manager';

// These tests can run with real DuckDB if the package is available
// Otherwise they will be skipped
describe('DuckDB Integration Tests', () => {
    let manager: DuckDBManager;
    let duckdbAvailable: boolean = false;

    // Check availability once before all tests
    beforeAll(async () => {
        try {
            await import('@duckdb/node-api');
            duckdbAvailable = true;
        } catch {
            duckdbAvailable = false;
        }
    });

    beforeEach(() => {
        manager = new DuckDBManager({
            database: ':memory:',
            enableHttpfs: false, // Disable S3 for basic tests
        });
    });

    afterEach(async () => {
        if (manager.isInitialized()) {
            await manager.cleanup();
        }
    });

    describe('Basic Operations', () => {
        it.skipIf(!duckdbAvailable)('should initialize and execute basic queries', async () => {
            await manager.initialize();
            expect(manager.isInitialized()).toBe(true);

            // Test basic SELECT
            const result = await manager.query('SELECT 1 as test_column');
            expect(result.rows).toHaveLength(1);
            expect(result.rows[0]).toEqual({ test_column: 1 });
        });

        it.skipIf(!duckdbAvailable)('should create and query tables', async () => {
            await manager.initialize();

            // Create table
            await manager.query(`
        CREATE TABLE test_table (
          id INTEGER,
          name VARCHAR,
          value DOUBLE
        )
      `);

            // Insert data
            await manager.query(`
        INSERT INTO test_table VALUES
        (1, 'first', 10.5),
        (2, 'second', 20.3),
        (3, 'third', 30.7)
      `);

            // Query data
            const result = await manager.query('SELECT * FROM test_table ORDER BY id');
            expect(result.rows).toHaveLength(3);
            expect(result.rows[0]).toEqual({ id: 1, name: 'first', value: 10.5 });
        });

        it.skipIf(!duckdbAvailable)('should handle parameterized queries', async () => {
            await manager.initialize();

            await manager.query(`
        CREATE TABLE param_test (id INTEGER, name VARCHAR)
      `);
            await manager.query(`
        INSERT INTO param_test VALUES (1, 'test1'), (2, 'test2')
      `);

            const result = await manager.query('SELECT * FROM param_test WHERE id = $1', [1]);

            expect(result.rows).toHaveLength(1);
            expect(result.rows[0]).toEqual({ id: 1, name: 'test1' });
        });
    });

    describe('CSV Operations', () => {
        it.skipIf(!duckdbAvailable)('should read CSV from string data', async () => {
            await manager.initialize();

            // Create a temporary CSV-like table for testing
            await manager.query(`
        CREATE TABLE csv_test AS
        SELECT * FROM VALUES
        (1, 'Alice', 25),
        (2, 'Bob', 30),
        (3, 'Carol', 35)
        AS t(id, name, age)
      `);

            const result = await manager.query('SELECT * FROM csv_test');
            expect(result.rows).toHaveLength(3);
            expect(result.rows[0]).toEqual({ id: 1, name: 'Alice', age: 25 });
        });
    });

    describe('Transactions', () => {
        it.skipIf(!duckdbAvailable)('should execute transactions successfully', async () => {
            await manager.initialize();

            const queries = [
                { sql: 'CREATE TABLE trans_test (id INTEGER, value TEXT)' },
                { sql: "INSERT INTO trans_test VALUES (1, 'first')" },
                { sql: "INSERT INTO trans_test VALUES (2, 'second')" },
            ];

            await manager.transaction(queries);

            const result = await manager.query('SELECT COUNT(*) as count FROM trans_test');
            expect(result.rows[0].count).toBe(2);
        });

        it.skipIf(!duckdbAvailable)('should rollback on transaction failure', async () => {
            await manager.initialize();

            // First create a table successfully
            await manager.query('CREATE TABLE rollback_test (id INTEGER PRIMARY KEY)');

            // Try a transaction that should fail
            const queries = [
                { sql: 'INSERT INTO rollback_test VALUES (1)' },
                { sql: 'INSERT INTO rollback_test VALUES (1)' }, // This should fail due to PRIMARY KEY constraint
            ];

            await expect(manager.transaction(queries)).rejects.toThrow();

            // Check that no data was inserted
            const result = await manager.query('SELECT COUNT(*) as count FROM rollback_test');
            expect(result.rows[0].count).toBe(0);
        });
    });

    describe('Schema Operations', () => {
        it.skipIf(!duckdbAvailable)('should describe table schema', async () => {
            await manager.initialize();

            await manager.query(`
        CREATE TABLE schema_test (
          id INTEGER PRIMARY KEY,
          name VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

            const schema = await manager.getTableSchema('schema_test');
            expect(schema.rows).toHaveLength(3);

            const columns = schema.rows.map((row) => row.column_name);
            expect(columns).toContain('id');
            expect(columns).toContain('name');
            expect(columns).toContain('created_at');
        });

        it.skipIf(!duckdbAvailable)('should list tables', async () => {
            await manager.initialize();

            await manager.query('CREATE TABLE table1 (id INTEGER)');
            await manager.query('CREATE TABLE table2 (id INTEGER)');

            const tables = await manager.listTables();
            const tableNames = tables.rows.map((row) => row.table_name);

            expect(tableNames).toContain('table1');
            expect(tableNames).toContain('table2');
        });
    });

    describe('Database Info', () => {
        it.skipIf(!duckdbAvailable)('should get database info', async () => {
            await manager.initialize();

            const info = await manager.getInfo();

            expect(info.version).toBeDefined();
            expect(typeof info.version).toBe('string');
            expect(info.s3Settings).toBeDefined();
            expect(Array.isArray(info.s3Settings)).toBe(true);
            expect(info.secrets).toBeDefined();
            expect(Array.isArray(info.secrets)).toBe(true);
        });
    });

    describe('Error Handling', () => {
        it.skipIf(!duckdbAvailable)('should handle SQL syntax errors', async () => {
            await manager.initialize();

            await expect(manager.query('INVALID SQL SYNTAX')).rejects.toThrow();
        });

        it.skipIf(!duckdbAvailable)('should handle non-existent table errors', async () => {
            await manager.initialize();

            await expect(manager.query('SELECT * FROM non_existent_table')).rejects.toThrow();
        });
    });

    describe('Cleanup', () => {
        it.skipIf(!duckdbAvailable)('should cleanup properly', async () => {
            await manager.initialize();
            expect(manager.isInitialized()).toBe(true);

            await manager.cleanup();
            expect(manager.isInitialized()).toBe(false);
        });
    });
});
