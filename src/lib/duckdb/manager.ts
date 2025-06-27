import { DuckDBConnection, DuckDBInstance } from '@duckdb/node-api';
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
    DuckDBConfig,
    JSONReadOptions,
    ParquetReadOptions,
    QueryResult,
    StreamQueryResult,
    TransactionQueryOptions,
} from './types';

export class DuckDBManager {
    private instance: DuckDBInstance | null = null;
    private connection: DuckDBConnection | null = null;
    private config: DuckDBConfig;

    constructor(config: DuckDBConfig = {}) {
        this.config = {
            database: ':memory:',
            enableHttpfs: true,
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
            if (this.config.enableHttpfs) {
                await this.connection.run('INSTALL httpfs;');
                await this.connection.run('LOAD httpfs;');
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
     * Read CSV files from S3 with advanced options
     */
    async readCSVFromS3(
        s3Path: string | string[],
        options: CSVReadOptions = {}
    ): Promise<QueryResult> {
        const pathStr = Array.isArray(s3Path)
            ? `[${s3Path.map((p) => `'${p}'`).join(', ')}]`
            : `'${s3Path}'`;

        let optionsStr = '';

        // Add CSV-specific options using correct parameter names from documentation
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

        let optionsStr = '';
        if (options.filename) optionsStr += ', filename = true';
        if (options.hive_partitioning) optionsStr += ', hive_partitioning = true';
        if (options.union_by_name) optionsStr += ', union_by_name = true';

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

        let optionsStr = '';
        if (options.filename) optionsStr += ', filename = true';
        if (options.format) optionsStr += `, format = '${options.format}'`;
        if (options.maximum_object_size)
            optionsStr += `, maximum_object_size = ${options.maximum_object_size}`;
        if (options.ignore_errors !== undefined)
            optionsStr += `, ignore_errors = ${options.ignore_errors}`;

        const query = `SELECT * FROM read_json(${pathStr}${optionsStr})`;
        return this.query(query);
    }

    /**
     * Generic method to read from S3 (maintained for backwards compatibility)
     */
    async readFromS3(
        s3Path: string | string[],
        format: 'parquet' | 'csv' | 'json' = 'parquet',
        options: any = {}
    ): Promise<QueryResult> {
        switch (format) {
            case 'csv':
                return this.readCSVFromS3(s3Path, options);
            case 'parquet':
                return this.readParquetFromS3(s3Path, options);
            case 'json':
                return this.readJSONFromS3(s3Path, options);
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

        let optionsStr = '';

        // Add CSV-specific options using correct parameter names
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

        let optionsStr = '';
        if (options.filename) optionsStr += ', filename = true';
        if (options.hive_partitioning) optionsStr += ', hive_partitioning = true';
        if (options.union_by_name) optionsStr += ', union_by_name = true';

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

        let optionsStr = '';
        if (options.filename) optionsStr += ', filename = true';
        if (options.format) optionsStr += `, format = '${options.format}'`;
        if (options.maximum_object_size)
            optionsStr += `, maximum_object_size = ${options.maximum_object_size}`;
        if (options.ignore_errors !== undefined)
            optionsStr += `, ignore_errors = ${options.ignore_errors}`;

        const query = `CREATE TABLE ${tableName} AS SELECT * FROM read_json(${pathStr}${optionsStr})`;
        await this.query(query);
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
}
