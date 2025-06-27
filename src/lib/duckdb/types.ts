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

export interface DuckDBConfig {
    database?: string; // ':memory:' for in-memory, or file path
    enableHttpfs?: boolean;
    s3?: S3Config;
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
