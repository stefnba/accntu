# DuckDB Manager

A comprehensive TypeScript wrapper for DuckDB with S3 support, built for modern Node.js applications.

## Features

- 🦆 **Full DuckDB Integration** - Complete wrapper around `@duckdb/node-api`
- ☁️ **S3 Support** - Read and write data directly from/to S3 using modern secrets approach
- 📊 **Multi-format Support** - CSV, Parquet, and JSON file handling
- 🔄 **Transaction Management** - ACID transaction support with automatic rollback
- 🛡️ **Type Safety** - Full TypeScript support with comprehensive type definitions
- 🧪 **Well Tested** - Comprehensive test suite with unit and integration tests
- 🚀 **Performance** - Streaming support for large datasets
- 🔧 **Flexible Configuration** - Support for various connection and S3 configurations

## Installation

```bash
bun add @duckdb/node-api
```

## Quick Start

```typescript
import { DuckDBManager } from '@/lib/duckdb';

const db = new DuckDBManager({
  database: ':memory:', // or file path
  s3: {
    region: 'us-east-1',
    accessKeyId: 'your-access-key',
    secretAccessKey: 'your-secret-key',
  },
});

await db.initialize();

// Read CSV from S3 with auto-detection
const result = await db.readCSVFromS3('s3://bucket/file.csv');
console.log(`Loaded ${result.rowCount} rows`);

await db.cleanup();
```

## Transformation Workflow (New!)

The DuckDB module now supports a powerful transformation workflow that:

1. **Reads** files from S3 (CSV, Parquet, JSON)
2. **Transforms** data using SQL with CTE approach
3. **Validates** each row with Zod schemas
4. **Returns** clean JSON with detailed metrics

### Key Features

- **CTE Approach**: Your SQL uses `FROM data` where `data` is automatically populated from S3
- **Zod Validation**: Every row is validated against your schema with detailed error reporting
- **Performance Metrics**: Get timing breakdown for read/transform/validate operations
- **Flexible Options**: Support all DuckDB CSV/Parquet/JSON options
- **Error Handling**: Graceful handling with detailed error messages

### Transformation Methods

#### transformData<T>()

Complete transformation with detailed results and error tracking:

```typescript
import { z } from 'zod';

const TransactionSchema = z.object({
  id: z.string(),
  amount: z.number(),
  description: z.string(),
  category: z.string(),
  date: z.string(),
  is_expense: z.boolean(),
});

const result = await db.transformData({
  source: {
    type: 'csv',
    path: 's3://bucket/transactions.csv',
    options: {
      delim: ';',
      normalize_names: true,
      dateformat: '%d-%m-%Y',
    },
  },
  // Your SQL transformation - 'data' is the CTE
  transformSql: `
    SELECT
      id::VARCHAR as id,
      amount::DECIMAL as amount,
      UPPER(TRIM(description)) as description,
      CASE
        WHEN LOWER(description) LIKE '%grocery%' THEN 'Food'
        WHEN LOWER(description) LIKE '%gas%' THEN 'Transportation'
        ELSE 'Other'
      END as category,
      authorised_on::VARCHAR as date,
      amount::DECIMAL < 0 as is_expense
    FROM data
    WHERE amount::DECIMAL != 0
    ORDER BY authorised_on::DATE DESC
  `,
  schema: TransactionSchema,
}, {
  continueOnValidationError: true,
  maxValidationErrors: 100,
  includeInvalidRows: false,
});

// Access results
console.log(`Processed: ${result.validRows}/${result.totalRows} rows`);
console.log(`Errors: ${result.errors.length}`);
console.log(`Performance: ${result.metrics.totalTimeMs}ms total`);
console.log('Valid data:', result.data);
console.log('Validation errors:', result.errors);
```

#### transformToValidatedJson<T>()

Simplified method that returns only validated data:

```typescript
const validTransactions = await db.transformToValidatedJson({
  source: { type: 'csv', path: 's3://bucket/data.csv' },
  transformSql: 'SELECT * FROM data WHERE amount > 0',
  schema: TransactionSchema,
});

// Returns T[] - only successfully validated rows
console.log('Valid transactions:', validTransactions);
```

### Complex SQL Examples

The CTE approach supports any SQL transformation:

```typescript
// Complex analytics with aggregation
const analyticsResult = await db.transformToValidatedJson({
  source: { type: 'csv', path: 's3://bucket/sales.csv' },
  transformSql: `
    WITH monthly_sales AS (
      SELECT
        product_category,
        DATE_TRUNC('month', sale_date::DATE) as month,
        SUM(amount::DECIMAL) as revenue,
        COUNT(*) as transaction_count
      FROM data
      WHERE amount::DECIMAL > 0
      GROUP BY product_category, DATE_TRUNC('month', sale_date::DATE)
    ),
    ranked_categories AS (
      SELECT
        *,
        ROW_NUMBER() OVER (PARTITION BY month ORDER BY revenue DESC) as rank
      FROM monthly_sales
    )
    SELECT
      product_category,
      month::VARCHAR as month,
      ROUND(revenue, 2) as revenue,
      transaction_count,
      rank
    FROM ranked_categories
    WHERE rank <= 5  -- Top 5 categories per month
    ORDER BY month, rank
  `,
  schema: z.object({
    product_category: z.string(),
    month: z.string(),
    revenue: z.number(),
    transaction_count: z.number(),
    rank: z.number(),
  }),
});
```

### Why CTE Approach?

**✅ Advantages:**
- **Familiar**: Standard SQL that any developer knows
- **Flexible**: Supports joins, window functions, complex transformations
- **Clear**: Clean separation between data source and business logic
- **Testable**: Easy to test SQL transformations independently
- **Optimizable**: DuckDB can optimize the entire query plan

**❌ Alternative approaches we considered:**
- Template replacement (`{{SOURCE}}`) - complex parsing, injection risks
- Function-based - less flexible, not SQL-native
- Schema-first - rigid, doesn't support dynamic transformations

## API Reference

### Configuration

#### DuckDBConfig

```typescript
interface DuckDBConfig {
  database?: string; // ':memory:' for in-memory, or file path
  enableHttpfs?: boolean; // Enable S3 support (default: true)
  s3?: S3Config;
}
```

#### S3Config

```typescript
interface S3Config {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  endpoint?: string;
  useCredentialChain?: boolean; // Use AWS credential chain instead of explicit keys
}
```

### Core Methods

#### Initialize and Cleanup

```typescript
await db.initialize(); // Initialize DuckDB instance and connection
await db.cleanup();    // Clean up resources
db.isInitialized();    // Check if initialized
```

#### Query Operations

```typescript
// Basic query
const result = await db.query('SELECT * FROM table');

// Parameterized query
const result = await db.query('SELECT * FROM table WHERE id = $1', [123]);

// Stream large results
const stream = await db.queryStream('SELECT * FROM large_table');
```

#### Transaction Management

```typescript
const queries = [
  { sql: 'CREATE TABLE test (id INT)' },
  { sql: 'INSERT INTO test VALUES (1)' },
  { sql: 'INSERT INTO test VALUES (2)' },
];

await db.transaction(queries);
```

### Data Import Methods

#### CSV from S3

```typescript
// Auto-detection (recommended)
const result = await db.readCSVFromS3('s3://bucket/file.csv');

// With specific options
const result = await db.readCSVFromS3('s3://bucket/file.csv', {
  delim: ';',
  header: true,
  skip: 1,
  encoding: 'UTF8',
  dateformat: '%d.%m.%Y',
  all_varchar: true,
  normalize_names: true,
});

// Multiple files
const result = await db.readCSVFromS3([
  's3://bucket/file1.csv',
  's3://bucket/file2.csv',
]);
```

#### Parquet from S3

```typescript
const result = await db.readParquetFromS3('s3://bucket/file.parquet', {
  hive_partitioning: true,
  filename: true,
});
```

#### JSON from S3

```typescript
const result = await db.readJSONFromS3('s3://bucket/file.json', {
  format: 'newline_delimited',
  ignore_errors: true,
});
```

### Table Creation

```typescript
// Create table from CSV
await db.createTableFromCSV('my_table', 's3://bucket/data.csv');

// Create table from Parquet
await db.createTableFromParquet('my_table', 's3://bucket/data.parquet');

// Create table from JSON
await db.createTableFromJSON('my_table', 's3://bucket/data.json');
```

### Data Export

```typescript
await db.exportToS3(
  'SELECT * FROM my_table',
  's3://bucket/output/',
  'parquet',
  {
    partitionBy: ['year', 'month'],
    overwriteOrIgnore: true,
  }
);
```

### Schema Operations

```typescript
// Get table schema
const schema = await db.getTableSchema('my_table');

// List all tables
const tables = await db.listTables();

// Get database info
const info = await db.getInfo();
```

## CSV Options Reference

Based on the [official DuckDB CSV documentation](https://duckdb.org/docs/stable/data/csv/overview):

```typescript
interface CSVReadOptions {
  delim?: string;              // Column separator (default: ',')
  quote?: string;              // Quote character (default: '"')
  escape?: string;             // Escape character
  header?: boolean;            // First row contains headers (default: true)
  skip?: number;               // Number of lines to skip at the start
  sample_size?: number;        // Maximum number of rows to read for sampling
  column_types?: Record<string, string>; // Column name to type mapping
  nullstr?: string[];          // Strings to treat as NULL
  dateformat?: string;         // Date format string (e.g., '%d.%m.%Y')
  timestampformat?: string;    // Timestamp format string
  encoding?: string;           // File encoding (default: 'UTF8')
  decimal_separator?: string;  // Decimal separator character
  thousands?: string;          // Thousands separator character
  auto_detect?: boolean;       // Auto-detect CSV configuration
  normalize_names?: boolean;   // Normalize column names
  all_varchar?: boolean;       // Read all columns as VARCHAR
}
```

## Error Handling

The library provides specific error types for different failure scenarios:

```typescript
import {
  DuckDBError,
  DuckDBInitializationError,
  DuckDBQueryError,
  DuckDBConnectionError,
  DuckDBS3Error,
  DuckDBTransactionError,
} from '@/lib/duckdb';

try {
  await db.query('SELECT * FROM table');
} catch (error) {
  if (error instanceof DuckDBQueryError) {
    console.error('Query failed:', error.message);
    console.error('SQL:', error.query);
  }
}
```

## Examples

### Environment Variables Setup

```bash
# .env file
AWS_BUCKET_REGION=eu-central-2
AWS_ACCESS_KEY=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

### Complete Example

```typescript
import { DuckDBManager } from '@/lib/duckdb';
import dotenv from 'dotenv';

dotenv.config();

const db = new DuckDBManager({
  database: ':memory:',
  s3: {
    region: process.env.AWS_BUCKET_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_BUCKET_REGION
      ? `s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com`
      : undefined,
  },
});

try {
  await db.initialize();

  // Load data from S3
  const data = await db.readCSVFromS3('s3://my-bucket/transactions.csv', {
    delim: ';',
    dateformat: '%d.%m.%Y',
    normalize_names: true,
  });

  console.log(`Loaded ${data.rowCount} transactions`);

  // Create table and run analysis
  await db.createTableFromCSV('transactions', 's3://my-bucket/transactions.csv');

  const analysis = await db.query(`
    SELECT
      DATE_TRUNC('month', date_column) as month,
      SUM(amount) as total_amount,
      COUNT(*) as transaction_count
    FROM transactions
    GROUP BY month
    ORDER BY month
  `);

  console.log('Monthly analysis:', analysis.rows);

  // Export results
  await db.exportToS3(
    'SELECT * FROM transactions WHERE amount > 100',
    's3://my-bucket/large-transactions/',
    'parquet'
  );

} catch (error) {
  console.error('Error:', error);
} finally {
  await db.cleanup();
}
```

## Running Tests

```bash
# Unit tests (mocked)
bun test src/lib/duckdb/__tests__/manager.test.ts
bun test src/lib/duckdb/__tests__/errors.test.ts

# Integration tests (requires @duckdb/node-api)
bun test src/lib/duckdb/__tests__/integration.test.ts
```

## Requirements

- Node.js 18+ (due to DuckDB requirements)
- `@duckdb/node-api` package
- For S3 functionality: Valid AWS credentials or IAM roles

## Best Practices

1. **Always cleanup**: Call `cleanup()` when done to free resources
2. **Use auto-detection**: For CSV files, try without options first
3. **Handle errors**: Wrap operations in try-catch blocks
4. **Use transactions**: For multiple related operations
5. **Stream large results**: Use `queryStream()` for large datasets

## Troubleshooting

### DuckDB Not Working with Bun

DuckDB requires Node.js runtime. Use with tsx:

```bash
node --import tsx your-script.ts
```

### S3 Connection Issues

1. Check AWS credentials and permissions
2. Verify bucket region matches configuration
3. Ensure bucket name and file paths are correct
4. Check network connectivity and firewall settings

### Memory Issues

- Use `:memory:` for temporary data
- Use file-based database for persistent storage
- Consider `queryStream()` for large datasets

## Excel Support

DuckDB Manager now supports reading Excel files (.xlsx format only) from S3 and local sources.

### Configuration

Enable Excel support when initializing the DuckDBManager:

```typescript
const manager = new DuckDBManager({
    enableHttpfs: true,  // Required for S3
    enableExcel: true,   // Enable Excel extension
    s3: {
        region: 'us-east-1',
        useCredentialChain: true,
    },
});
```

### Reading Excel Files from S3

```typescript
// Basic Excel reading
const result = await manager.readExcelFromS3('s3://bucket/data.xlsx');

// Read specific sheet
const sheetResult = await manager.readExcelFromS3('s3://bucket/data.xlsx', {
    sheet: 'Sheet2',
    header: true,
});

// Read specific range
const rangeResult = await manager.readExcelFromS3('s3://bucket/data.xlsx', {
    range: 'A1:E100',
    header: true,
    stop_at_empty: false,
});

// Advanced options
const advancedResult = await manager.readExcelFromS3('s3://bucket/data.xlsx', {
    sheet: 'Data',
    range: 'B5:Z',        // Skip first 4 rows and column A
    header: true,
    all_varchar: false,   // Let DuckDB infer types
    empty_as_varchar: false,
    ignore_errors: true,  // Replace errors with NULL
});
```

### Excel Options

```typescript
interface ExcelReadOptions {
    sheet?: string;           // Sheet name (default: first sheet)
    range?: string;           // Cell range (e.g., 'A1:B10', 'A5:Z', 'E:Z')
    header?: boolean;         // First row contains headers (auto-detected)
    stop_at_empty?: boolean;  // Stop at first empty row
    empty_as_varchar?: boolean; // Treat empty cells as VARCHAR
    all_varchar?: boolean;    // Read all cells as VARCHAR
    ignore_errors?: boolean;  // Replace conversion errors with NULL
}
```

### Creating Tables from Excel

```typescript
// Create table from Excel file
await manager.createTableFromExcel('my_table', 's3://bucket/data.xlsx', {
    sheet: 'Sheet1',
    header: true,
});

// Query the created table
const tableData = await manager.query('SELECT * FROM my_table LIMIT 10');
```

### Using Excel in Transformation Pipelines

```typescript
const result = await manager.transformData({
    source: {
        type: 'excel',
        path: 's3://bucket/financial-data.xlsx',
        options: {
            sheet: 'Transactions',
            range: 'A2:Z',  // Skip header row
            header: true,
            ignore_errors: true,
        },
    },
    transformSql: `
        SELECT
            date_column::DATE as transaction_date,
            amount_column::DECIMAL(10,2) as amount,
            UPPER(description_column) as description
        FROM data
        WHERE amount_column IS NOT NULL
          AND amount_column > 0
    `,
    schema: z.object({
        transaction_date: z.date(),
        amount: z.number(),
        description: z.string(),
    }),
});
```

### Excel File Analysis

Before processing large Excel files, you can analyze their structure:

```typescript
// Read sample to understand structure
const sample = await manager.readExcelFromS3('s3://bucket/data.xlsx', {
    range: '1:10',  // First 10 rows only
});

console.log('Columns:', sample.columns);
console.log('Sample data:', sample.rows);

// Create temporary table to inspect schema
await manager.createTableFromExcel('temp_analysis', 's3://bucket/data.xlsx', {
    range: '1:100',  // Sample for type inference
    header: true,
});

const schema = await manager.getTableSchema('temp_analysis');
console.log('Inferred schema:', schema.rows);

// Clean up
await manager.query('DROP TABLE temp_analysis');
```

### Important Notes

- Only `.xlsx` files are supported (not `.xls`)
- Excel extension requires DuckDB to load the spatial extension
- Large Excel files may take time to process - consider using `range` parameter for sampling
- DuckDB automatically infers data types based on cell content and formatting
- Empty cells are treated as `DOUBLE` by default, use `empty_as_varchar: true` to change this
- The `ignore_errors: true` option is useful for handling mixed data types in columns

### Common Use Cases

1. **Financial Reports**: Read quarterly reports with multiple sheets
2. **Data Import**: Convert Excel files to structured database tables
3. **ETL Pipelines**: Transform Excel data as part of larger data workflows
4. **Data Analysis**: Query Excel files directly without manual conversion
