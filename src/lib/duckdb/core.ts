import { localUploadService } from '@/lib/upload/local/service';
import { DuckDBConnection, DuckDBInstance } from '@duckdb/node-api';
import { createWriteStream } from 'node:fs';
import {
    DuckDBConnectionError,
    DuckDBInitializationError,
    DuckDBQueryError,
    DuckDBS3Error,
    DuckDBTransactionError,
} from './errors';
import type {
    CSVReadOptions,
    DatabaseInfo,
    DataSource,
    DuckDBConfig,
    ExcelReadOptions,
    JSONReadOptions,
    ParquetReadOptions,
    QueryResult,
    StreamQueryResult,
    TransactionQueryOptions,
} from './types';

/**
 * Core DuckDB functionality manager.
 * Handles instance creation, connections, extensions, and basic queries.
 * This is the base class that other specialized managers inherit from.
 */
export class DuckDBCore {
    protected instance: DuckDBInstance | null = null;
    protected connection: DuckDBConnection | null = null;
    protected config: DuckDBConfig;

    constructor(config: DuckDBConfig = {}) {
        this.config = {
            database: ':memory:',
            enableHttpfs: false,
            enableExcel: false,
            ...config,
        };
    }

    /**
     * Initialize DuckDB instance and connection
     */
    async initialize(): Promise<void> {
        try {
            // Create instance
            this.instance = await DuckDBInstance.create(this.config.database);
            this.connection = await this.instance.connect();

            // Install and load httpfs extension for S3 support if enabled
            if (this.config.enableHttpfs || this.config.s3) {
                await this.connection.run('INSTALL httpfs;');
                await this.connection.run('LOAD httpfs;');
            }

            // Install and load Excel extension if enabled
            if (this.config.enableExcel) {
                // Excel extension is a core extension that should be available by default
                // We may need to install it depending on the DuckDB version
                try {
                    await this.connection.run('LOAD spatial;'); // Required for Excel extension
                } catch (error) {
                    console.warn('Excel extension may not be available:', error);
                }
            }

            // Install and load PostgreSQL extension if postgres config is provided
            if (this.config.enablePostgres || this.config.postgres) {
                await this.connection.run('INSTALL postgres;');
                await this.connection.run('LOAD postgres;');

                if (this.config.postgres) {
                    await this.setupPostgresConnection();
                }
            }

            // Configure S3 using modern secrets approach
            if (this.config.s3) {
                await this.setupS3Secrets();
            }
        } catch (error) {
            await this.cleanup();
            throw new DuckDBInitializationError(
                error instanceof Error ? error.message : String(error),
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Setup S3 using modern secrets approach
     */
    private async setupS3Secrets(): Promise<void> {
        if (!this.config.s3) return;

        console.log('Setting up S3 secrets...');

        const s3Config = this.config.s3;

        try {
            if (s3Config.accessKeyId && s3Config.secretAccessKey && !s3Config.useCredentialChain) {
                // Use explicit credentials
                let secretQuery = `
        CREATE OR REPLACE SECRET default_s3_secret (
          TYPE S3,
          KEY_ID '${s3Config.accessKeyId}',
          SECRET '${s3Config.secretAccessKey}'`;

                if (s3Config.region) {
                    secretQuery += `,\n          REGION '${s3Config.region}'`;
                }

                if (s3Config.sessionToken) {
                    secretQuery += `,\n          SESSION_TOKEN '${s3Config.sessionToken}'`;
                }

                if (s3Config.endpoint) {
                    secretQuery += `,\n          ENDPOINT '${s3Config.endpoint}'`;
                }

                secretQuery += '\n        );';

                await this.connection!.run(secretQuery);
            } else {
                // Use credential chain (picks up from environment, ~/.aws/credentials, IAM roles, etc.)
                let secretQuery = `
        CREATE OR REPLACE SECRET default_s3_secret (
          TYPE S3,
          PROVIDER credential_chain`;

                if (s3Config.region) {
                    secretQuery += `,\n          REGION '${s3Config.region}'`;
                }

                secretQuery += '\n        );';

                await this.connection!.run(secretQuery);
            }
        } catch (error) {
            throw new DuckDBS3Error(
                error instanceof Error ? error.message : String(error),
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Setup PostgreSQL connection using ATTACH statement with configurable options
     */
    private async setupPostgresConnection(): Promise<void> {
        if (!this.config.postgres) return;

        console.log('Setting up PostgreSQL connection...');

        const pgConfig = this.config.postgres;

        try {
            // Build ATTACH query with configurable options
            const alias = pgConfig.alias || 'pg_db';
            const options: string[] = ['TYPE postgres'];

            // Add read-only option (default: true)
            if (pgConfig.readOnly !== false) {
                options.push('READ_ONLY');
            }

            // Add schema option if specified
            if (pgConfig.schema) {
                options.push(`SCHEMA '${pgConfig.schema}'`);
            }

            // Add secret option if specified
            if (pgConfig.useSecret && pgConfig.secretName) {
                options.push(`SECRET ${pgConfig.secretName}`);
            }

            const optionsString = options.join(', ');

            let attachQuery: string;
            if (pgConfig.useSecret) {
                // Use empty connection string when using secrets
                attachQuery = `ATTACH '' AS ${alias} (${optionsString});`;
            } else {
                // Use connection string directly
                attachQuery = `ATTACH '${pgConfig.connectionString}' AS ${alias} (${optionsString});`;
            }

            await this.connection!.run(attachQuery);
            console.log(`PostgreSQL connection established successfully as '${alias}'`);

            // Store the alias for use in queries
            this.config.postgres.alias = alias;
        } catch (error) {
            console.warn('Failed to setup PostgreSQL connection:', error);
            throw new DuckDBInitializationError(
                `PostgreSQL connection failed: ${error instanceof Error ? error.message : String(error)}`,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Execute a SQL query with optional parameters
     */
    async query(sql: string, params?: Record<string, any> | any[]): Promise<QueryResult> {
        if (!this.connection) {
            throw new DuckDBConnectionError('DuckDB not initialized. Call initialize() first.');
        }

        try {
            const result = await this.connection.run(sql, params);
            const rowObjects = await result.getRowObjects();
            const columns = await result.getColumns();

            return {
                rows: rowObjects,
                columns: columns.map((_, index) => `column_${index}`),
                rowCount: rowObjects.length,
            };
        } catch (error) {
            throw new DuckDBQueryError(
                error instanceof Error ? error.message : String(error),
                sql,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Execute a query and return results as a stream (useful for large datasets)
     */
    async queryStream(
        sql: string,
        params?: Record<string, any> | any[]
    ): Promise<StreamQueryResult> {
        if (!this.connection) {
            throw new DuckDBConnectionError('DuckDB not initialized. Call initialize() first.');
        }

        try {
            const reader = await this.connection.streamAndRead(sql, params);
            await reader.readAll();

            return {
                rows: reader.getRowObjects(),
                columns: reader.getColumns().map((_, index) => `column_${index}`),
                rowCount: reader.getRowObjects().length,
            };
        } catch (error) {
            throw new DuckDBQueryError(
                error instanceof Error ? error.message : String(error),
                sql,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Execute multiple queries in a transaction
     */
    async transaction(
        queries: Array<{ sql: string; params?: Record<string, any> | any[] }>
    ): Promise<QueryResult[]> {
        if (!this.connection) {
            throw new DuckDBConnectionError('DuckDB not initialized. Call initialize() first.');
        }

        try {
            await this.connection.run('BEGIN TRANSACTION');

            const results: QueryResult[] = [];
            for (const query of queries) {
                const result = await this.query(query.sql, query.params);
                results.push(result);
            }

            await this.connection.run('COMMIT');
            return results;
        } catch (error) {
            await this.connection.run('ROLLBACK');
            throw new DuckDBTransactionError(
                error instanceof Error ? error.message : String(error),
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Get table schema information
     */
    async getTableSchema(tableName: string): Promise<QueryResult> {
        return this.query(`DESCRIBE ${tableName}`);
    }

    /**
     * List all tables in the database
     */
    async listTables(): Promise<QueryResult> {
        return this.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'main'"
        );
    }

    /**
     * Export data to S3 with partitioning support
     */
    async exportToS3(
        sql: string,
        s3Path: string,
        format: 'parquet' | 'csv' | 'json' = 'parquet',
        options: TransactionQueryOptions = {}
    ): Promise<void> {
        let copyOptions = `FORMAT ${format.toUpperCase()}`;

        if (format === 'csv') {
            const delimiter = options.csvOptions?.delimiter || ',';
            const header = options.csvOptions?.header !== false; // default true
            copyOptions += `, DELIMITER '${delimiter}'`;
            if (header) copyOptions += ', HEADER';
        }

        if (options.partitionBy && options.partitionBy.length > 0) {
            copyOptions += `, PARTITION_BY (${options.partitionBy.join(', ')})`;
        }

        if (options.overwriteOrIgnore) {
            copyOptions += ', OVERWRITE_OR_IGNORE true';
        }

        const exportQuery = `COPY (${sql}) TO '${s3Path}' (${copyOptions})`;
        await this.query(exportQuery, options.params);
    }

    /**
     * Check if DuckDB is initialized
     */
    isInitialized(): boolean {
        return this.connection !== null && this.instance !== null;
    }

    /**
     * Get connection info including S3 secrets
     */
    async getInfo(): Promise<DatabaseInfo> {
        if (!this.connection) {
            throw new DuckDBConnectionError('DuckDB not initialized. Call initialize() first.');
        }

        const versionResult = await this.query('SELECT version()');
        const settingsResult = await this.query(
            "SELECT name, value FROM duckdb_settings() WHERE name LIKE 's3_%'"
        );

        // Try to get secrets info (may fail if no secrets are configured)
        let secretsInfo: Record<string, any>[] = [];
        try {
            const secretsResult = await this.query(
                'SELECT name, type, provider FROM duckdb_secrets()'
            );
            secretsInfo = secretsResult.rows;
        } catch {
            // Secrets table might not be available
        }

        return {
            version: versionResult.rows[0]?.version,
            s3Settings: settingsResult.rows,
            secrets: secretsInfo,
            database: this.config.database,
        };
    }

    /**
     * Get the PostgreSQL database alias for use in queries
     */
    getPostgresAlias(): string {
        return this.config.postgres?.alias || 'pg_db';
    }

    /**
     * Clean up resources
     */
    async cleanup(): Promise<void> {
        try {
            if (this.connection) {
                this.connection = null; // Connection cleanup is handled by instance
            }
            if (this.instance) {
                this.instance = null; // Instances are auto-cleaned by GC in Node.js Neo API
            }
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }

    /**
     * Automatically cleanup on process exit
     */
    setupCleanupHandlers(): void {
        const cleanup = () => {
            this.cleanup().catch(console.error);
        };

        process.on('exit', cleanup);
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        process.on('uncaughtException', cleanup);
    }

    /**
     * Create temporary table from JavaScript array objects
     */
    async createTempTableFromArray<T extends Record<string, any>>(
        tableName: string,
        data: T[]
    ): Promise<void> {
        if (data.length === 0) {
            throw new DuckDBQueryError('Cannot create table from empty array');
        }

        // Use DuckDB's native JSON processing without JavaScript loops
        // Convert entire array to single JSON string and let DuckDB parse it

        const jsonArrayString = JSON.stringify(data).replace(/'/g, "''");
        const columns = Object.keys(data[0]);

        // Get type information from first row for proper type casting
        const firstRow = data[0];
        const columnTypes = columns.map((col) => {
            const value = firstRow[col];
            if (typeof value === 'number') {
                return Number.isInteger(value) ? 'INTEGER' : 'DOUBLE';
            } else if (typeof value === 'boolean') {
                return 'BOOLEAN';
            } else if (value instanceof Date) {
                return 'TIMESTAMP';
            }
            return 'VARCHAR';
        });

        try {
            // DuckDB approach: Use read_json_auto function with virtual file
            // This is more efficient than unnest approaches
            await this.query(`CREATE TEMPORARY TABLE ${tableName}_raw (json_data JSON)`);
            await this.query(`INSERT INTO ${tableName}_raw VALUES ('[${jsonArrayString}]'::JSON)`);

            // Extract columns with proper type casting using DuckDB's JSON path syntax
            const columnExtractions = columns
                .map((col, idx) => {
                    const type = columnTypes[idx];
                    if (type === 'INTEGER') {
                        return `(json_data -> '$[*].${col}')::INTEGER[] AS "${col}"`;
                    } else if (type === 'DOUBLE') {
                        return `(json_data -> '$[*].${col}')::DOUBLE[] AS "${col}"`;
                    } else if (type === 'BOOLEAN') {
                        return `(json_data -> '$[*].${col}')::BOOLEAN[] AS "${col}"`;
                    } else {
                        return `(json_data -> '$[*].${col}')::VARCHAR[] AS "${col}"`;
                    }
                })
                .join(', ');

            // Create the table by unnesting the arrays
            await this.query(`
                CREATE TEMPORARY TABLE ${tableName}_arrays AS
                SELECT ${columnExtractions}
                FROM ${tableName}_raw
            `);

            // Unnest all arrays to create final row-based table
            const unnestExpressions = columns
                .map((col) => `unnest("${col}") AS "${col}"`)
                .join(', ');

            await this.query(`
                CREATE TEMPORARY TABLE ${tableName} AS
                SELECT ${unnestExpressions}
                FROM ${tableName}_arrays
            `);

            // Clean up intermediate tables
            await this.query(`DROP TABLE ${tableName}_raw`);
            await this.query(`DROP TABLE ${tableName}_arrays`);
        } catch (error) {
            // Fallback to the JSON VALUES approach if advanced JSON fails
            const valuesClause = data
                .map((row) => {
                    const jsonString = JSON.stringify(row).replace(/'/g, "''");
                    return `('${jsonString}'::JSON)`;
                })
                .join(', ');

            // Build column extractions with proper typing
            const columnExtractions = columns
                .map((col, idx) => {
                    const type = columnTypes[idx];
                    if (type === 'INTEGER') {
                        return `CAST(json_data ->> '$.${col}' AS INTEGER) AS "${col}"`;
                    } else if (type === 'DOUBLE') {
                        return `CAST(json_data ->> '$.${col}' AS DOUBLE) AS "${col}"`;
                    } else if (type === 'BOOLEAN') {
                        return `CAST(json_data ->> '$.${col}' AS BOOLEAN) AS "${col}"`;
                    } else if (type === 'TIMESTAMP') {
                        return `CAST(json_data ->> '$.${col}' AS TIMESTAMP) AS "${col}"`;
                    } else {
                        return `json_data ->> '$.${col}' AS "${col}"`;
                    }
                })
                .join(', ');

            await this.query(`
                CREATE TEMPORARY TABLE ${tableName} AS
                SELECT ${columnExtractions}
                FROM (VALUES ${valuesClause}) AS t(json_data)
            `);
        }
    }

    /**
     * Query JavaScript array objects using DuckDB's native JSON array processing
     * Zero JavaScript loops - leverages DuckDB's columnar JSON functions
     *
     * @param data - The array of objects to query
     * @param sql - The SQL query to execute
     * @param arrayAlias - The alias for the array in the SQL query
     */
    async queryArrayObjectsNative<T extends Record<string, any>>(
        data: T[],
        sql: string,
        arrayAlias: string = 'data'
    ): Promise<QueryResult> {
        if (data.length === 0) {
            return { rows: [], columns: [], rowCount: 0 };
        }

        // Create a temporary table from the array data
        const tempTableName = `temp_native_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        try {
            await this.createTempTableFromArray(tempTableName, data);

            // Replace the alias with the temp table name
            const wrappedSql = sql.replace(new RegExp(`\\b${arrayAlias}\\b`, 'g'), tempTableName);

            const result = await this.query(wrappedSql);

            // Clean up temp table
            await this.query(`DROP TABLE ${tempTableName}`);

            return result;
        } catch (error) {
            // Ensure cleanup on error
            try {
                await this.query(`DROP TABLE IF EXISTS ${tempTableName}`);
            } catch {
                // Ignore cleanup errors
            }
            throw error;
        }
    }

    /**
     * Query JavaScript array objects using DuckDB's JSON VALUES clause
     * Good for small datasets - uses JavaScript loops but minimal overhead
     *
     * @param data - The array of objects to query
     * @param sql - The SQL query to execute
     * @param arrayAlias - The alias for the array in the SQL query
     */
    async queryArrayObjectsJSON<T extends Record<string, any>>(
        data: T[],
        sql: string,
        arrayAlias: string = 'data'
    ): Promise<QueryResult> {
        if (data.length === 0) {
            return { rows: [], columns: [], rowCount: 0 };
        }

        // Get all unique keys from the data to build column list
        const allKeys = new Set<string>();
        data.forEach((row) => Object.keys(row).forEach((key) => allKeys.add(key)));
        const columns = Array.from(allKeys);

        // Build VALUES clause with JSON extraction
        const valuesClause = data
            .map((row) => {
                const jsonString = JSON.stringify(row).replace(/'/g, "''");
                return `('${jsonString}'::JSON)`;
            })
            .join(', ');

        // Get type information for proper casting
        const firstRow = data[0];
        const columnTypes = columns.map((col) => {
            const value = firstRow[col];
            if (typeof value === 'number') {
                return Number.isInteger(value) ? 'INTEGER' : 'DOUBLE';
            } else if (typeof value === 'boolean') {
                return 'BOOLEAN';
            } else if (value instanceof Date) {
                return 'TIMESTAMP';
            }
            return 'VARCHAR';
        });

        // Build column extraction with proper type casting
        const columnExtractions = columns
            .map((col, idx) => {
                const type = columnTypes[idx];
                if (type === 'INTEGER') {
                    return `CAST(json_data ->> '$.${col}' AS INTEGER) AS "${col}"`;
                } else if (type === 'DOUBLE') {
                    return `CAST(json_data ->> '$.${col}' AS DOUBLE) AS "${col}"`;
                } else if (type === 'BOOLEAN') {
                    return `CAST(json_data ->> '$.${col}' AS BOOLEAN) AS "${col}"`;
                } else if (type === 'TIMESTAMP') {
                    return `CAST(json_data ->> '$.${col}' AS TIMESTAMP) AS "${col}"`;
                } else {
                    return `json_data ->> '$.${col}' AS "${col}"`;
                }
            })
            .join(', ');

        // Create the data source SQL
        const dataSourceSql = `(
            SELECT ${columnExtractions}
            FROM (VALUES ${valuesClause}) AS t(json_data)
        )`;

        // Replace the alias with the data source
        const wrappedSql = sql.replace(new RegExp(`\\b${arrayAlias}\\b`, 'g'), dataSourceSql);

        return await this.query(wrappedSql);
    }

    /**
     * Query JavaScript array objects using temporary tables
     * Better performance for large datasets (1000+ rows)
     *
     * @param data - The array of objects to query
     * @param sql - The SQL query to execute
     * @param arrayAlias - The alias for the array in the SQL query
     */
    async queryArrayObjectsTable<T extends Record<string, any>>(
        data: T[],
        sql: string,
        arrayAlias: string = 'data'
    ): Promise<QueryResult> {
        if (data.length === 0) {
            return { rows: [], columns: [], rowCount: 0 };
        }

        // Create a temporary table from the array data and then query it
        const tempTableName = `temp_array_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        try {
            await this.createTempTableFromArray(tempTableName, data);

            // Replace the alias with the temp table name
            const wrappedSql = sql.replace(new RegExp(`\\b${arrayAlias}\\b`, 'g'), tempTableName);

            const result = await this.query(wrappedSql);

            // Clean up temp table
            await this.query(`DROP TABLE ${tempTableName}`);

            return result;
        } catch (error) {
            // Ensure cleanup on error
            try {
                await this.query(`DROP TABLE IF EXISTS ${tempTableName}`);
            } catch {
                // Ignore cleanup errors
            }
            throw error;
        }
    }

    /**
     * Smart array querying that chooses the best method based on data characteristics
     * Automatically selects between JSON VALUES and native table approaches
     *
     * @param data - The array of objects to query
     * @param sql - The SQL query to execute
     * @param arrayAlias - The alias for the array in the SQL query
     * @param forceMethod - Force a specific method for testing
     */
    async queryArrayObjects<T extends Record<string, any>>(
        data: T[],
        sql: string,
        arrayAlias: string = 'data',
        forceMethod?: 'json' | 'native'
    ): Promise<QueryResult> {
        if (data.length === 0) {
            return { rows: [], columns: [], rowCount: 0 };
        }

        // Choose method based on characteristics
        if (forceMethod === 'json') {
            return this.queryArrayObjectsJSON(data, sql, arrayAlias);
        } else if (forceMethod === 'native') {
            return this.queryArrayObjectsNative(data, sql, arrayAlias);
        }

        // Smart selection based on data size and complexity
        if (data.length < 500) {
            // Small datasets: JSON VALUES approach has lower overhead
            return this.queryArrayObjectsJSON(data, sql, arrayAlias);
        } else {
            // Large datasets: Native table approach is more efficient
            return this.queryArrayObjectsNative(data, sql, arrayAlias);
        }
    }

    /**
     * Advanced array processing with type inference and validation
     * Optimized for large datasets with streaming support
     */
    async processArrayStream<T extends Record<string, any>, R = any>(
        data: T[],
        processor: {
            sql: string;
            batchSize?: number;
            arrayAlias?: string;
            validator?: (row: any) => R;
        }
    ): Promise<R[]> {
        const { sql, batchSize = 5000, arrayAlias = 'data', validator } = processor;
        const results: R[] = [];

        // Process in batches for memory efficiency
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const batchResult = await this.queryArrayObjects(batch, sql, arrayAlias);

            for (const row of batchResult.rows) {
                if (validator) {
                    results.push(validator(row));
                } else {
                    results.push(row as R);
                }
            }
        }

        return results;
    }

    /**
     * Create a virtual table view from JavaScript arrays - smart method selection
     * Chooses optimal approach based on data size
     */
    async createArrayView<T extends Record<string, any>>(
        viewName: string,
        data: T[],
        forceMethod?: 'json' | 'table'
    ): Promise<void> {
        if (data.length === 0) {
            throw new DuckDBQueryError('Cannot create view from empty array');
        }

        // Choose method based on size, unless forced
        const useJsonMethod =
            forceMethod === 'json' || (forceMethod !== 'table' && data.length < 1000);

        if (useJsonMethod) {
            return this.createArrayViewJSON(viewName, data);
        } else {
            return this.createArrayViewTable(viewName, data);
        }
    }

    /**
     * Create view using JSON VALUES approach - good for small datasets
     */
    async createArrayViewJSON<T extends Record<string, any>>(
        viewName: string,
        data: T[]
    ): Promise<void> {
        // Get all unique keys from the data to build column list
        const allKeys = new Set<string>();
        data.forEach((row) => Object.keys(row).forEach((key) => allKeys.add(key)));
        const columns = Array.from(allKeys);

        // Build VALUES clause with JSON extraction
        const valuesClause = data
            .map((row) => {
                const jsonString = JSON.stringify(row).replace(/'/g, "''");
                return `('${jsonString}'::JSON)`;
            })
            .join(', ');

        // Build column extraction for SELECT using arrow operators for automatic type handling
        const columnExtractions = columns
            .map((col) => `json_data ->> '$.${col}' AS "${col}"`)
            .join(', ');

        // Create the view with JSON-based data source
        const createViewQuery = `
            CREATE OR REPLACE VIEW ${viewName} AS
            SELECT ${columnExtractions}
            FROM (VALUES ${valuesClause}) AS t(json_data)
        `;

        await this.query(createViewQuery);
    }

    /**
     * Create view using temporary table approach - better for large datasets
     */
    async createArrayViewTable<T extends Record<string, any>>(
        viewName: string,
        data: T[]
    ): Promise<void> {
        // Create a temporary table first
        const tempTableName = `${viewName}_temp_${Date.now()}`;
        await this.createTempTableFromArray(tempTableName, data);

        // Create a view that references the temp table
        const createViewQuery = `
            CREATE OR REPLACE VIEW ${viewName} AS
            SELECT * FROM ${tempTableName}
        `;

        await this.query(createViewQuery);
    }

    /**
     * Bulk insert array data into existing PostgreSQL table
     * Uses DuckDB's PostgreSQL extension for efficient bulk operations
     */
    async bulkInsertToPostgres<T extends Record<string, any>>(
        data: T[],
        postgresTable: string,
        options: {
            batchSize?: number;
            onConflict?: 'ignore' | 'update' | 'error';
            conflictColumns?: string[];
        } = {}
    ): Promise<void> {
        if (!this.config.postgres) {
            throw new DuckDBQueryError('PostgreSQL configuration not provided');
        }

        if (data.length === 0) {
            return;
        }

        const { batchSize = 1000, onConflict = 'error' } = options;
        const pgAlias = this.getPostgresAlias();
        const fullTableName = `${pgAlias}.${postgresTable}`;

        // Process in batches
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const tempViewName = `temp_bulk_insert_${Date.now()}_${Math.random().toString(36).substring(7)}`;

            try {
                // Create temporary view from batch data
                await this.createArrayView(tempViewName, batch);

                // Build insert query based on conflict resolution
                let insertQuery = `INSERT INTO ${fullTableName} SELECT * FROM ${tempViewName}`;

                if (onConflict === 'ignore') {
                    insertQuery += ' ON CONFLICT DO NOTHING';
                } else if (onConflict === 'update' && options.conflictColumns) {
                    const updateColumns = Object.keys(batch[0])
                        .filter((col) => !options.conflictColumns!.includes(col))
                        .map((col) => `${col} = EXCLUDED.${col}`)
                        .join(', ');

                    insertQuery += ` ON CONFLICT (${options.conflictColumns.join(', ')}) DO UPDATE SET ${updateColumns}`;
                }

                await this.query(insertQuery);

                // Clean up view
                await this.query(`DROP VIEW ${tempViewName}`);
            } catch (error) {
                // Ensure cleanup on error
                try {
                    await this.query(`DROP VIEW IF EXISTS ${tempViewName}`);
                } catch {
                    // Ignore cleanup errors
                }
                throw error;
            }
        }
    }

    /**
     * Load data from a JSON stream (e.g., API response) into DuckDB
     * Handles very large JSON datasets efficiently using temporary files
     *
     * @param jsonStream - ReadableStream containing JSON data
     * @param tableName - Name of the table to create
     * @param options - Options for JSON processing
     */
    async loadFromJsonStream(
        jsonStream: ReadableStream,
        tableName: string,
        options: {
            format?: 'array' | 'newline-delimited';
            maxFileSize?: number; // MB
        } = {}
    ): Promise<QueryResult> {
        // Note: format and maxFileSize options available for future enhancements

        return await localUploadService.createTempFileForFn(
            {
                file: Buffer.from(''), // Will be written by pipeline
                fileExtension: 'json',
                fileName: `stream_${tableName}_${Date.now()}`,
            },
            async (tempFilePath) => {
                // Stream JSON data to temporary file
                const fileStream = createWriteStream(tempFilePath);

                // Convert ReadableStream to Node.js readable stream
                const reader = jsonStream.getReader();
                try {
                    let done = false;
                    while (!done) {
                        const { done: chunkDone, value } = await reader.read();
                        done = chunkDone;
                        if (value) {
                            fileStream.write(value);
                        }
                    }
                } finally {
                    reader.releaseLock();
                }

                try {
                    // Use DuckDB's read_json_auto to efficiently load the JSON file
                    const sql = `CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_json_auto('${tempFilePath}')`;
                    await this.query(sql);

                    // Return summary of loaded data
                    return await this.query(`SELECT COUNT(*) as rows_loaded FROM ${tableName}`);
                } catch (error) {
                    throw new DuckDBQueryError(
                        `Failed to load JSON stream into table ${tableName}: ${error instanceof Error ? error.message : String(error)}`,
                        `read_json_auto('${tempFilePath}')`,
                        error instanceof Error ? error : undefined
                    );
                }
            }
        );
    }

    /**
     * Fetch JSON from API and load directly into DuckDB
     * Ideal for large API responses that don't fit in memory
     *
     * @param url - API URL to fetch JSON from
     * @param tableName - Name of the table to create
     * @param options - Fetch and JSON processing options
     */
    async loadFromApiJson(
        url: string,
        tableName: string,
        options: {
            fetchOptions?: RequestInit;
            jsonFormat?: 'array' | 'newline-delimited';
            maxFileSize?: number;
        } = {}
    ): Promise<QueryResult> {
        const { fetchOptions = {}, jsonFormat = 'array', maxFileSize = 1000 } = options;

        try {
            // Fetch the API response as a stream
            const response = await fetch(url, fetchOptions);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            if (!response.body) {
                throw new Error('Response body is empty');
            }

            // Use the streaming loader
            return await this.loadFromJsonStream(response.body, tableName, {
                format: jsonFormat,
                maxFileSize,
            });
        } catch (error) {
            throw new DuckDBQueryError(
                `Failed to load API JSON from ${url}: ${error instanceof Error ? error.message : String(error)}`,
                `loadFromApiJson(${url})`,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Process large JavaScript arrays by streaming them to a temporary JSON file
     * More memory efficient than in-memory approaches for very large datasets
     *
     * @param data - Large JavaScript array to process
     * @param tableName - Name of the table to create
     * @param options - Processing options
     */
    async loadLargeArrayViaStream<T extends Record<string, any>>(
        data: T[],
        tableName: string,
        options: {
            batchSize?: number;
            format?: 'array' | 'newline-delimited';
        } = {}
    ): Promise<QueryResult> {
        const { batchSize = 10000, format = 'array' } = options;

        if (data.length < batchSize) {
            // Use existing efficient method for smaller arrays
            await this.createTempTableFromArray(tableName, data);
            return await this.query(`SELECT COUNT(*) as rows_loaded FROM ${tableName}`);
        }

        return await localUploadService.createTempFileForFn(
            {
                file: Buffer.from(''), // Will be written by stream
                fileExtension: 'json',
                fileName: `large_array_${tableName}_${Date.now()}`,
            },
            async (tempFilePath) => {
                const fileStream = createWriteStream(tempFilePath);

                try {
                    if (format === 'array') {
                        // Write as JSON array
                        fileStream.write('[');

                        for (let i = 0; i < data.length; i += batchSize) {
                            const batch = data.slice(i, i + batchSize);
                            const jsonBatch = batch.map((row) => JSON.stringify(row)).join(',');

                            if (i > 0) fileStream.write(',');
                            fileStream.write(jsonBatch);
                        }

                        fileStream.write(']');
                    } else {
                        // Write as newline-delimited JSON
                        for (let i = 0; i < data.length; i += batchSize) {
                            const batch = data.slice(i, i + batchSize);
                            const jsonLines = batch.map((row) => JSON.stringify(row)).join('\n');
                            fileStream.write(jsonLines);
                            if (i + batchSize < data.length) fileStream.write('\n');
                        }
                    }

                    fileStream.end();

                    // Wait for stream to finish
                    await new Promise<void>((resolve, reject) => {
                        fileStream.on('finish', () => resolve());
                        fileStream.on('error', reject);
                    });

                    // Load using DuckDB's read_json_auto
                    const sql = `CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_json_auto('${tempFilePath}')`;
                    await this.query(sql);

                    return await this.query(`SELECT COUNT(*) as rows_loaded FROM ${tableName}`);
                } catch (error) {
                    throw new DuckDBQueryError(
                        `Failed to load large array via stream: ${error instanceof Error ? error.message : String(error)}`,
                        `loadLargeArrayViaStream(${data.length} rows)`,
                        error instanceof Error ? error : undefined
                    );
                }
            }
        );
    }

    /**
     * Load JavaScript objects or JSON data using temporary file approach
     * Uses DuckDB's read_json_auto for optimal performance with any size dataset
     *
     * @param data - JavaScript array of objects or JSON string
     * @param tableName - Name of the table to create
     * @param options - Processing options
     */
    async loadFromTempFile<T extends Record<string, any>>(
        data: T[] | string,
        tableName: string,
        options: {
            format?: 'array' | 'newline-delimited';
            dropIfExists?: boolean;
        } = {}
    ): Promise<QueryResult> {
        const { format = 'array', dropIfExists = true } = options;

        // Convert data to JSON string if it's an array
        const jsonData = typeof data === 'string' ? data : JSON.stringify(data);

        return await localUploadService.createTempFileForFn(
            {
                file: Buffer.from(jsonData, 'utf8'),
                fileExtension: 'json',
                fileName: `temp_${tableName}_${Date.now()}`,
            },
            async (tempFilePath) => {
                try {
                    // Drop table if it exists and requested
                    if (dropIfExists) {
                        await this.query(`DROP TABLE IF EXISTS ${tableName}`);
                    }

                    // Use DuckDB's read_json_auto for optimal performance
                    const sql = `CREATE TABLE ${tableName} AS SELECT * FROM read_json_auto('${tempFilePath}')`;
                    await this.query(sql);

                    // Return summary of loaded data
                    return await this.query(`SELECT COUNT(*) as rows_loaded FROM ${tableName}`);
                } catch (error) {
                    throw new DuckDBQueryError(
                        `Failed to load data from temp file into table ${tableName}: ${error instanceof Error ? error.message : String(error)}`,
                        `read_json_auto('${tempFilePath}')`,
                        error instanceof Error ? error : undefined
                    );
                }
            }
        );
    }

    /**
     * Query JavaScript objects using temporary file approach
     * Alternative to in-memory methods that uses DuckDB's read_json_auto
     * Particularly useful for very large datasets or when you want consistent performance
     *
     * @param data - JavaScript array of objects or JSON string
     * @param sql - SQL query to execute
     * @param arrayAlias - Alias for the data in the SQL query
     * @param options - Processing options
     */
    async queryArrayObjectsViaFile<T extends Record<string, any>>(
        data: T[] | string,
        sql: string,
        arrayAlias: string = 'data',
        options: {
            format?: 'array' | 'newline-delimited';
            cleanupTable?: boolean;
        } = {}
    ): Promise<QueryResult> {
        const { format = 'array', cleanupTable = true } = options;
        const tempTableName = `temp_query_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        try {
            // Load data into temporary table
            await this.loadFromTempFile(data, tempTableName, { format });

            // Replace alias with temp table name and execute query
            const wrappedSql = sql.replace(new RegExp(`\\b${arrayAlias}\\b`, 'g'), tempTableName);
            const result = await this.query(wrappedSql);

            return result;
        } finally {
            // Cleanup temp table
            if (cleanupTable) {
                try {
                    await this.query(`DROP TABLE IF EXISTS ${tempTableName}`);
                } catch {
                    // Ignore cleanup errors
                }
            }
        }
    }

    /**
     * Enhanced smart array querying that includes file-based approach
     * Automatically selects the best method based on data characteristics
     *
     * @param data - The array of objects to query
     * @param sql - The SQL query to execute
     * @param arrayAlias - The alias for the array in the SQL query
     * @param options - Method selection and processing options
     */
    async queryArrayObjectsEnhanced<T extends Record<string, any>>(
        data: T[],
        sql: string,
        arrayAlias: string = 'data',
        options: {
            forceMethod?: 'json' | 'native' | 'file' | 'auto';
            fileThreshold?: number;
            nativeThreshold?: number;
        } = {}
    ): Promise<QueryResult> {
        const { forceMethod = 'auto', fileThreshold = 100000, nativeThreshold = 500 } = options;

        if (data.length === 0) {
            return { rows: [], columns: [], rowCount: 0 };
        }

        // Force specific method if requested
        if (forceMethod === 'json') {
            return this.queryArrayObjectsJSON(data, sql, arrayAlias);
        } else if (forceMethod === 'native') {
            return this.queryArrayObjectsNative(data, sql, arrayAlias);
        } else if (forceMethod === 'file') {
            return this.queryArrayObjectsViaFile(data, sql, arrayAlias);
        }

        // Auto selection based on data size
        if (data.length < nativeThreshold) {
            // Small datasets: JSON VALUES approach
            return this.queryArrayObjectsJSON(data, sql, arrayAlias);
        } else if (data.length < fileThreshold) {
            // Medium datasets: Native JSON processing
            return this.queryArrayObjectsNative(data, sql, arrayAlias);
        } else {
            // Very large datasets: File-based approach
            return this.queryArrayObjectsViaFile(data, sql, arrayAlias);
        }
    }

    /**
     * Build the appropriate data source SQL based on file type
     */
    buildDataSourceSql(source: DataSource): string {
        const pathStr = Array.isArray(source.path)
            ? `[${source.path.map((p) => `'${p}'`).join(', ')}]`
            : `'${source.path}'`;

        switch (source.type) {
            case 'csv': {
                const options = source.options as CSVReadOptions;
                if (!options || Object.keys(options).length === 0) {
                    return `SELECT * FROM read_csv_auto(${pathStr})`;
                }
                return `SELECT * FROM read_csv(${pathStr}${this.buildCsvOptionsString(options)})`;
            }

            case 'parquet': {
                const options = source.options as ParquetReadOptions;
                return `SELECT * FROM read_parquet(${pathStr}${this.buildParquetOptionsString(options || {})})`;
            }

            case 'json': {
                const options = source.options as JSONReadOptions;
                return `SELECT * FROM read_json(${pathStr}${this.buildJsonOptionsString(options || {})})`;
            }

            case 'excel': {
                const options = source.options as ExcelReadOptions;
                return `SELECT * FROM read_xlsx(${pathStr}${this.buildExcelOptionsString(options || {})})`;
            }

            default:
                throw new DuckDBQueryError(`Unsupported data source type: ${(source as any).type}`);
        }
    }

    /**
     * Build CSV options string for SQL query
     */
    private buildCsvOptionsString(options: CSVReadOptions): string {
        let optionsStr = '';

        if (options.delim) optionsStr += `, delim = '${options.delim}'`;
        if (options.quote) optionsStr += `, quote = '${options.quote}'`;
        if (options.escape) optionsStr += `, escape = '${options.escape}'`;
        if (options.header !== undefined) optionsStr += `, header = ${options.header}`;
        if (options.skip) optionsStr += `, skip = ${options.skip}`;
        if (options.sample_size) optionsStr += `, sample_size = ${options.sample_size}`;
        if (options.nullstr)
            optionsStr += `, nullstr = [${options.nullstr.map((s: string) => `'${s}'`).join(', ')}]`;
        if (options.dateformat) optionsStr += `, dateformat = '${options.dateformat}'`;
        if (options.timestampformat)
            optionsStr += `, timestampformat = '${options.timestampformat}'`;
        if (options.encoding) optionsStr += `, encoding = '${options.encoding}'`;
        if (options.decimal_separator)
            optionsStr += `, decimal_separator = '${options.decimal_separator}'`;
        if (options.thousands) optionsStr += `, thousands = '${options.thousands}'`;
        if (options.auto_detect !== undefined)
            optionsStr += `, auto_detect = ${options.auto_detect}`;
        if (options.normalize_names !== undefined)
            optionsStr += `, normalize_names = ${options.normalize_names}`;
        if (options.all_varchar !== undefined)
            optionsStr += `, all_varchar = ${options.all_varchar}`;
        if (options.column_types) {
            const colTypes = Object.entries(options.column_types)
                .map(([name, type]) => `'${name}': '${type}'`)
                .join(', ');
            optionsStr += `, column_types = {${colTypes}}`;
        }

        return optionsStr;
    }

    /**
     * Build Parquet options string for SQL query
     */
    private buildParquetOptionsString(options: ParquetReadOptions): string {
        let optionsStr = '';
        if (options.filename) optionsStr += ', filename = true';
        if (options.hive_partitioning) optionsStr += ', hive_partitioning = true';
        if (options.union_by_name) optionsStr += ', union_by_name = true';
        return optionsStr;
    }

    /**
     * Build JSON options string for SQL query
     */
    private buildJsonOptionsString(options: JSONReadOptions): string {
        let optionsStr = '';
        if (options.filename) optionsStr += ', filename = true';
        if (options.format) optionsStr += `, format = '${options.format}'`;
        if (options.maximum_object_size)
            optionsStr += `, maximum_object_size = ${options.maximum_object_size}`;
        if (options.ignore_errors !== undefined)
            optionsStr += `, ignore_errors = ${options.ignore_errors}`;
        return optionsStr;
    }

    /**
     * Build Excel options string for read_xlsx function
     */
    private buildExcelOptionsString(options: ExcelReadOptions): string {
        let optionsStr = '';
        if (options.sheet) optionsStr += `, sheet = '${options.sheet}'`;
        if (options.range) optionsStr += `, range = '${options.range}'`;
        if (options.header !== undefined) optionsStr += `, header = ${options.header}`;
        if (options.stop_at_empty !== undefined)
            optionsStr += `, stop_at_empty = ${options.stop_at_empty}`;
        if (options.empty_as_varchar !== undefined)
            optionsStr += `, empty_as_varchar = ${options.empty_as_varchar}`;
        if (options.all_varchar !== undefined)
            optionsStr += `, all_varchar = ${options.all_varchar}`;
        if (options.ignore_errors !== undefined)
            optionsStr += `, ignore_errors = ${options.ignore_errors}`;
        return optionsStr;
    }

    /**
     * Read CSV files from S3 with advanced options
     */
    async readCSVFromS3(
        s3Path: string | string[],
        options: CSVReadOptions = {}
    ): Promise<QueryResult> {
        const pathStr = Array.isArray(s3Path)
            ? `[${s3Path.map((p) => `'${p}'`).join(', ')}]`
            : `'${s3Path}'`;

        const optionsStr = this.buildCsvOptionsString(options);

        // Try read_csv_auto first, then fall back to read_csv with options
        let query = `SELECT * FROM read_csv_auto(${pathStr})`;

        // If options are provided, use read_csv with options
        if (optionsStr) {
            query = `SELECT * FROM read_csv(${pathStr}${optionsStr})`;
        }

        return this.query(query);
    }

    /**
     * Read Parquet files from S3
     */
    async readParquetFromS3(
        s3Path: string | string[],
        options: ParquetReadOptions = {}
    ): Promise<QueryResult> {
        const pathStr = Array.isArray(s3Path)
            ? `[${s3Path.map((p) => `'${p}'`).join(', ')}]`
            : `'${s3Path}'`;

        const optionsStr = this.buildParquetOptionsString(options);
        const query = `SELECT * FROM read_parquet(${pathStr}${optionsStr})`;
        return this.query(query);
    }

    /**
     * Read JSON files from S3
     */
    async readJSONFromS3(
        s3Path: string | string[],
        options: JSONReadOptions = {}
    ): Promise<QueryResult> {
        const pathStr = Array.isArray(s3Path)
            ? `[${s3Path.map((p) => `'${p}'`).join(', ')}]`
            : `'${s3Path}'`;

        const optionsStr = this.buildJsonOptionsString(options);
        const query = `SELECT * FROM read_json(${pathStr}${optionsStr})`;
        return this.query(query);
    }

    /**
     * Read Excel files from S3 (.xlsx format only)
     */
    async readExcelFromS3(
        s3Path: string | string[],
        options: ExcelReadOptions = {}
    ): Promise<QueryResult> {
        const pathStr = Array.isArray(s3Path)
            ? `[${s3Path.map((p) => `'${p}'`).join(', ')}]`
            : `'${s3Path}'`;

        const optionsStr = this.buildExcelOptionsString(options);
        const query = `SELECT * FROM read_xlsx(${pathStr}${optionsStr})`;
        return this.query(query);
    }

    /**
     * Generic method to read from S3 (maintained for backwards compatibility)
     */
    async readFromS3(
        s3Path: string | string[],
        format: 'parquet' | 'csv' | 'json' | 'excel' = 'parquet',
        options: any = {}
    ): Promise<QueryResult> {
        switch (format) {
            case 'csv':
                return this.readCSVFromS3(s3Path, options);
            case 'parquet':
                return this.readParquetFromS3(s3Path, options);
            case 'json':
                return this.readJSONFromS3(s3Path, options);
            case 'excel':
                return this.readExcelFromS3(s3Path, options);
            default:
                throw new DuckDBQueryError(`Unsupported format: ${format}`);
        }
    }

    /**
     * Create a table from CSV data in S3
     */
    async createTableFromCSV(
        tableName: string,
        s3Path: string | string[],
        options: CSVReadOptions = {}
    ): Promise<void> {
        const pathStr = Array.isArray(s3Path)
            ? `[${s3Path.map((p) => `'${p}'`).join(', ')}]`
            : `'${s3Path}'`;

        const optionsStr = this.buildCsvOptionsString(options);

        // Use read_csv_auto if no options provided, otherwise use read_csv with options
        let query: string;
        if (optionsStr) {
            query = `CREATE TABLE ${tableName} AS SELECT * FROM read_csv(${pathStr}${optionsStr})`;
        } else {
            query = `CREATE TABLE ${tableName} AS SELECT * FROM read_csv_auto(${pathStr})`;
        }

        await this.query(query);
    }

    /**
     * Create a table from Parquet data in S3
     */
    async createTableFromParquet(
        tableName: string,
        s3Path: string | string[],
        options: ParquetReadOptions = {}
    ): Promise<void> {
        const pathStr = Array.isArray(s3Path)
            ? `[${s3Path.map((p) => `'${p}'`).join(', ')}]`
            : `'${s3Path}'`;

        const optionsStr = this.buildParquetOptionsString(options);
        const query = `CREATE TABLE ${tableName} AS SELECT * FROM read_parquet(${pathStr}${optionsStr})`;
        await this.query(query);
    }

    /**
     * Create a table from JSON data in S3
     */
    async createTableFromJSON(
        tableName: string,
        s3Path: string | string[],
        options: JSONReadOptions = {}
    ): Promise<void> {
        const pathStr = Array.isArray(s3Path)
            ? `[${s3Path.map((p) => `'${p}'`).join(', ')}]`
            : `'${s3Path}'`;

        const optionsStr = this.buildJsonOptionsString(options);
        const query = `CREATE TABLE ${tableName} AS SELECT * FROM read_json(${pathStr}${optionsStr})`;
        await this.query(query);
    }

    /**
     * Create a table from Excel data in S3
     */
    async createTableFromExcel(
        tableName: string,
        s3Path: string | string[],
        options: ExcelReadOptions = {}
    ): Promise<void> {
        const pathStr = Array.isArray(s3Path)
            ? `[${s3Path.map((p) => `'${p}'`).join(', ')}]`
            : `'${s3Path}'`;

        const optionsStr = this.buildExcelOptionsString(options);
        const query = `CREATE TABLE ${tableName} AS SELECT * FROM read_xlsx(${pathStr}${optionsStr})`;
        await this.query(query);
    }
}
