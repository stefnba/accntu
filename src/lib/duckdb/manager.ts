import { DuckDBConnection, DuckDBInstance } from '@duckdb/node-api';
import { z } from 'zod';
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
    TransformationConfig,
    TransformationOptions,
    TransformationResult,
} from './types';

export class DuckDBManager {
    private instance: DuckDBInstance | null = null;
    private connection: DuckDBConnection | null = null;
    private config: DuckDBConfig;

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
     * Transform data from S3 with CTE approach and Zod validation
     *
     * @example
     * ```typescript
     * const result = await db.transformData({
     *   source: {
     *     type: 'csv',
     *     path: 's3://bucket/transactions.csv',
     *     options: { delim: ';', normalize_names: true }
     *   },
     *   transformSql: `
     *     SELECT
     *       amount::DECIMAL as amount,
     *       UPPER(description) as description,
     *       DATE_TRUNC('month', authorised_on::DATE) as month
     *     FROM data
     *     WHERE amount::DECIMAL > 0
     *   `,
     *   schema: z.object({
     *     amount: z.number(),
     *     description: z.string(),
     *     month: z.string()
     *   })
     * });
     * ```
     */
    async transformData<T>(
        config: TransformationConfig<T>,
        options: TransformationOptions = {}
    ): Promise<TransformationResult<T>> {
        const startTime = Date.now();
        let readTime = 0;
        let transformTime = 0;
        let validationTime = 0;

        const {
            continueOnValidationError = true,
            maxValidationErrors = 100,
            includeInvalidRows = false,
        } = options;

        try {
            // Step 1: Build the data source CTE with optional ID generation
            const readStartTime = Date.now();
            const dataSourceSql = this.buildDataSourceSql(config.source);

            let fullQuery: string;

            // If idConfig is provided, generate a deterministic ID from the raw data
            if (config.idConfig) {
                const idLength = 25; // 25 characters is the max length of a UUID
                const defaultIdName = 'id';

                // Generate SQL that includes ID generation in the CTE
                const idFieldName = config.idConfig.fieldName || defaultIdName;
                const hashColumns = config.idConfig.columns
                    .map((col) => `COALESCE(CAST("${col}" AS VARCHAR), '')`)
                    .join(` || '|' || `);

                fullQuery = `
                    WITH raw_data AS (${dataSourceSql}),
                    data AS (
                        SELECT *,
                            SUBSTR(MD5(${hashColumns}), 1, ${idLength}) as ${idFieldName}
                        FROM raw_data
                    )
                    ${config.transformSql}
                `;
            } else {
                fullQuery = `
                    WITH data AS (${dataSourceSql})
                    ${config.transformSql}
                `;
            }

            readTime = Date.now() - readStartTime;

            // Step 2: Execute transformation query
            const transformStartTime = Date.now();
            const result = await this.query(fullQuery, config.params);
            transformTime = Date.now() - transformStartTime;

            // Step 3: Validate each row with Zod schema
            const validationStartTime = Date.now();
            const validatedData: T[] = [];
            const validationErrors: Array<{
                rowIndex: number;
                row: Record<string, any>;
                error: z.ZodError;
            }> = [];

            for (let i = 0; i < result.rows.length; i++) {
                const row = result.rows[i];

                try {
                    const validatedRow = config.schema.parse(row);
                    validatedData.push(validatedRow);
                } catch (error) {
                    if (error instanceof z.ZodError) {
                        validationErrors.push({
                            rowIndex: i,
                            row: includeInvalidRows ? row : {},
                            error,
                        });

                        // Stop if we've reached max validation errors and not continuing on error
                        if (
                            !continueOnValidationError ||
                            validationErrors.length >= maxValidationErrors
                        ) {
                            break;
                        }
                    } else {
                        throw error; // Re-throw non-Zod errors
                    }
                }
            }

            validationTime = Date.now() - validationStartTime;
            const totalTime = Date.now() - startTime;

            return {
                data: result.rows,
                validatedData: validatedData,
                totalRows: result.rowCount,
                validRows: validatedData.length,
                errors: validationErrors,
                metrics: {
                    readTimeMs: readTime,
                    transformTimeMs: transformTime,
                    validationTimeMs: validationTime,
                    totalTimeMs: totalTime,
                },
            };
        } catch (error) {
            if (error instanceof DuckDBQueryError) {
                throw error;
            }
            throw new DuckDBQueryError(
                `Transformation failed: ${error instanceof Error ? error.message : String(error)}`,
                config.transformSql,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Transform data and return only successfully validated rows as JSON
     * This is a convenience method for the most common use case
     */
    async transformToValidatedJson<T>(
        config: TransformationConfig<T>,
        options: TransformationOptions = {}
    ): Promise<T[]> {
        const result = await this.transformData(config, options);

        if (result.errors.length > 0 && !options.continueOnValidationError) {
            throw new DuckDBQueryError(
                `Validation failed for ${result.errors.length} rows. First error: ${result.errors[0].error.message}`,
                config.transformSql
            );
        }

        return result.validatedData;
    }

    /**
     * Build the appropriate data source SQL based on file type
     * @param source - The data source configuration
     * @returns The SQL query to read the data source
     */
    private buildDataSourceSql(source: DataSource): string {
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
