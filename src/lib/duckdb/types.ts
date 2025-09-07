import type { z } from 'zod';

export interface S3Config {
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
    endpoint?: string;
    useCredentialChain?: boolean; // Use AWS credential chain instead of explicit keys
}

export interface CSVReadOptions {
    delim?: string; // Column separator (default: ','), can also use 'sep'
    quote?: string; // Quote character (default: '"')
    escape?: string; // Escape character
    header?: boolean; // First row contains headers (default: true)
    skip?: number; // Number of lines to skip at the start
    sample_size?: number; // Maximum number of rows to read for sampling
    column_types?: Record<string, string>; // Column name to type mapping, can also use 'types' or 'dtypes'
    nullstr?: string[]; // Strings to treat as NULL
    dateformat?: string; // Date format string
    timestampformat?: string; // Timestamp format string
    encoding?: string; // File encoding (default: 'UTF8')
    decimal_separator?: string; // Decimal separator character
    thousands?: string; // Thousands separator character
    auto_detect?: boolean; // Auto-detect CSV configuration
    normalize_names?: boolean; // Normalize column names
    all_varchar?: boolean; // Read all columns as VARCHAR
}

export interface ParquetReadOptions {
    filename?: boolean; // Add filename column
    hive_partitioning?: boolean; // Enable Hive partitioning
    union_by_name?: boolean; // Union files by column name instead of position
}

export interface JSONReadOptions {
    filename?: boolean; // Add filename column
    format?: 'auto' | 'unstructured' | 'newline_delimited' | 'array'; // JSON format
    maximum_object_size?: number; // Maximum size of JSON objects
    ignore_errors?: boolean; // Ignore parsing errors
}

export interface ExcelReadOptions {
    sheet?: string; // Name of the Excel worksheet (default: first sheet)
    range?: string; // Cell range to read (e.g., 'A1:B10', 'A5:Z', 'E:Z')
    header?: boolean; // First row contains headers (auto-detected by default)
    stop_at_empty?: boolean; // Stop reading at first empty row (default: true when no range, false when range provided)
    empty_as_varchar?: boolean; // Treat empty cells as VARCHAR instead of DOUBLE (default: false)
    all_varchar?: boolean; // Read all cells as VARCHAR (default: false)
    ignore_errors?: boolean; // Replace cells that can't be cast with NULL (default: false)
}

export interface PostgreSQLConfig {
    connectionString: string;
    connectionLimit?: number;
    timeout?: number;

    // DuckDB PostgreSQL extension specific options
    alias?: string; // Database alias name (default: 'pg_db')
    schema?: string; // Specific PostgreSQL schema to attach (default: all schemas)
    readOnly?: boolean; // Attach as read-only (default: true)
    useSecret?: boolean; // Use DuckDB secret instead of connection string (default: false)
    secretName?: string; // Name of the secret if useSecret is true
}

export interface DuckDBConfig {
    database?: string; // ':memory:' for in-memory, or file path
    enableHttpfs?: boolean; // Optional override - auto-detected from s3 config
    enableExcel?: boolean; // Enable Excel extension
    enablePostgres?: boolean; // Optional override - auto-detected from postgres config
    s3?: S3Config; // HTTPfs extension auto-loaded when present
    postgres?: PostgreSQLConfig; // PostgreSQL extension auto-loaded when present
}

export interface QueryResult {
    rows: Record<string, any>[];
    columns: string[];
    rowCount: number;
}

export interface TransactionQueryOptions {
    params?: Record<string, any> | any[];
    partitionBy?: string[];
    overwriteOrIgnore?: boolean;
    csvOptions?: {
        delimiter?: string;
        header?: boolean;
    };
}

export interface StreamQueryResult {
    rows: Record<string, any>[];
    columns: string[];
    rowCount: number;
}

export interface DatabaseInfo {
    version?: string;
    s3Settings: Record<string, any>[];
    secrets: Record<string, any>[];
    database?: string;
}

// New types for transformation workflow
export type DataSource = {
    type: 'csv' | 'parquet' | 'json' | 'excel';
    path: string | string[];
    options?: CSVReadOptions | ParquetReadOptions | JSONReadOptions | ExcelReadOptions;
};

export interface TransformationConfig<T = any> {
    /** The data source configuration */
    source: DataSource;
    /** SQL transformation query that uses 'data' as the CTE name */
    transformSql: string;
    /** Zod schema for validating each row */
    schema: z.ZodSchema<T>;
    /** Optional parameters for the SQL query */
    params?: Record<string, any> | any[];
    /** Configuration for generating deterministic IDs from raw data */
    idConfig?: {
        /** Raw column names to use for ID generation (before transformation) */
        columns: string[];
        /** Field name to store the generated ID (default: 'id') */
        fieldName?: string;
        /** Connected bank account ID for unique key generation */
        connectedBankAccountId?: string;
    };
}

export interface FieldError {
    path: PropertyKey[];
    message: string;
    value: any;
}

export interface RowValidationError {
    rowIndex: number;
    row: Record<string, any>;
    errors: FieldError[];
}

export interface FieldErrorSummary {
    /** A list of unique error messages for this field. */
    messages: string[];
    /** A few examples of invalid values that caused errors. */
    examples: any[];
}

export type AggregatedValidationErrors = Record<string, FieldErrorSummary>;

export interface TransformationResult<T = any> {
    /** Raw rows from the transformation query */
    data: Record<string, any>[];
    /** Successfully validated rows */
    validatedData: T[];
    /** Total number of rows processed */
    totalRows: number;
    /** Number of successfully validated rows */
    validRows: number;
    /** Structured validation errors for each failed row (up to `maxErrorDetailRows`). */
    validationErrors: RowValidationError[];
    /** An aggregated summary of errors by field path. */
    aggregatedErrors: AggregatedValidationErrors;
    /** Performance metrics */
    metrics: {
        readTimeMs: number;
        transformTimeMs: number;
        validationTimeMs: number;
        totalTimeMs: number;
    };
    /** Temporary table name if `storeInTempTable` is true */
    tempTableName?: string;
}

export interface TransformationOptions {
    /** Continue processing even if some rows fail validation */
    continueOnValidationError?: boolean;
    /** Maximum number of validation errors to collect before stopping */
    maxValidationErrors?: number;
    /**
     * Maximum number of invalid rows to report with detailed, field-level errors.
     * @default 25
     */
    maxErrorDetailRows?: number;
    /**
     * Maximum number of invalid value examples to collect for each field in the aggregated error report.
     * @default 5
     */
    maxExamplesPerField?: number;
    /**
     * Whether to return raw rows that failed validation
     * @default false
     */
    includeInvalidRows?: boolean;
    /**
     * Whether to store the validated data in a temporary table
     * @default false
     */
    storeInTempTable?: boolean;
}
