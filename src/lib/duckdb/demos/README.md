# DuckDB Demos

This folder contains demonstration scripts showcasing different aspects of the DuckDB integration with S3 and local file processing.

## Demo Overview

### 🔍 Demo 1: Simple S3 Query (`1-query-s3.ts`)

**Purpose**: Basic S3 data reading without transformation or validation

**Features**:

- Connect to S3 with credential chain
- Read CSV data directly from S3
- Display raw data structure and basic statistics
- Run simple SQL aggregation queries
- No data transformation or validation

**Use Case**: When you need to quickly explore and analyze raw data from S3 without any processing.

### 🔄 Demo 2: S3 Data Transformation (`2-transformation-s3.ts`)
**Purpose**: Complete data transformation pipeline with S3 source

**Features**:
- Read CSV data from S3
- Generate deterministic IDs from raw column data
- Transform European date/number formats to standard formats
- Validate results with Zod schemas
- Handle validation errors gracefully
- Detailed performance metrics and analysis

**Use Case**: Production data processing where you need to transform raw S3 data into validated, standardized formats.

### 📁 Demo 3: Local File Transformation (`3-local-transformation.ts`)

**Purpose**: Local file processing with comprehensive ID generation demonstration

**Features**:
- Process local CSV files (no S3 required)
- Generate deterministic IDs from raw column data
- Transform European number formats
- Validate with Zod schemas
- Show detailed ID generation process
- Test ID consistency across multiple runs
- Comprehensive transformation analysis

**Use Case**: Development and testing scenarios, or when working with local data files.

## Legacy Demos

The folder also contains older demo files that showcase different patterns:

- `query-s3.ts` - Complex S3 queries with multiple examples
- `transformation.ts` - S3 transformation with detailed credit card data processing
- `local-transformation.ts` - Original local transformation demo

## Quick Start

### Run Individual Demos

```bash
# Demo 1: Simple S3 Query
node --import tsx src/lib/duckdb/demos/1-query-s3.ts

# Demo 2: S3 Transformation
node --import tsx src/lib/duckdb/demos/2-transformation-s3.ts

# Demo 3: Local Transformation
node --import tsx src/lib/duckdb/demos/3-local-transformation.ts
```

### Run All Demos

```bash
# Run all demos in sequence
node --import tsx src/lib/duckdb/demos/index.ts

# Run specific demo by number
node --import tsx src/lib/duckdb/demos/index.ts 1
node --import tsx src/lib/duckdb/demos/index.ts 2
node --import tsx src/lib/duckdb/demos/index.ts 3

# Show help
node --import tsx src/lib/duckdb/demos/index.ts --help
```

## Prerequisites

### For S3 Demos (1 & 2)
- AWS credentials configured (via environment variables, ~/.aws/credentials, or IAM roles)
- Access to the S3 bucket: `s3://accntu/`
- Environment variables (optional, uses credential chain by default):
  ```bash
  AWS_ACCESS_KEY_ID=your_access_key
  AWS_SECRET_ACCESS_KEY=your_secret_key
  AWS_BUCKET_REGION=us-east-1
  ```

### For Local Demo (3)
- Local test file: `src/lib/duckdb/demos/test_transactions.csv` (provided)
- No S3 credentials required

## Data Format

All demos work with European-formatted CSV transaction data:

```csv
Card Number: **** **** **** 1234
Account Holder: Test User

Authorised on;Processed on;Amount;Currency;Description;Payment type;Status;Amount in foreign currency;Currency;Exchange rate
28.05.2025;29.05.2025;-123,45;EUR;Test Purchase 1;Card payment;Processed;-123,45;EUR;1,00
29.05.2025;30.05.2025;1500,00;EUR;Salary Payment;Transfer;Processed;1500,00;EUR;1,00
```

**Key Features**:
- European date format: `DD.MM.YYYY`
- European decimal format: `1500,00` (comma as decimal separator)
- Semicolon delimiters
- Header rows that need to be skipped

## ID Generation Feature

Demos 2 and 3 showcase the deterministic ID generation feature:

```typescript
idConfig: {
  columns: ['Authorised on', 'Description', 'Amount', 'Currency'], // Raw column names
  fieldName: 'id', // Output field name
}
```

**How it works**:
1. Extracts specified raw column values before transformation
2. Creates hash input: `"28.05.2025|Test Purchase 1|-123,45|EUR"`
3. Generates MD5 hash and takes first 25 characters
4. Same input always produces same ID (deterministic)

## Transformation Examples

### Date Conversion
```sql
-- Convert DD.MM.YYYY to YYYY-MM-DD
strftime(strptime("Authorised on", '%d.%m.%Y'), '%Y-%m-%d') as date
```

### European Number Conversion
```sql
-- Convert 1.234,56 to 1234.56
CAST(
  REGEXP_REPLACE(
    REGEXP_REPLACE("Amount", '([0-9]+)\\.([0-9]{3})', '\\1\\2'),
    '(-?[0-9]+),([0-9]+)',
    '\\1.\\2'
  ) AS DOUBLE
) as amount
```

### Transaction Type Detection
```sql
-- Determine debit/credit based on amount sign
CASE
  WHEN amount < 0 THEN 'debit'
  ELSE 'credit'
END as type
```

## Error Handling

All demos include comprehensive error handling:

- **Connection errors**: S3 credential issues, network problems
- **Data format errors**: Invalid CSV structure, encoding issues
- **Transformation errors**: SQL syntax, type conversion failures
- **Validation errors**: Zod schema validation failures

## Performance Metrics

Each demo provides detailed performance metrics:

- **Read time**: Time to read data from source
- **Transform time**: Time to execute SQL transformation
- **Validation time**: Time to validate with Zod schemas
- **Total time**: End-to-end processing time

## Output Examples

### Demo 1 Output
```
🚀 Demo 1: Simple S3 Query (No Transformation)

✅ DuckDB initialized with S3 support
📊 Reading CSV data from S3...
✅ Successfully read 20 rows
📋 Columns found: 10

📈 Basic Statistics:
- Total transactions: 20
- Processed transactions: 20
- Unique currencies: EUR
- Date range: 01.01.2025 to 31.12.2025
```

### Demo 2 Output
```
🚀 Demo 2: S3 Data Transformation with Validation

✅ DuckDB initialized with S3 support
🔄 Starting transformation process...

📊 Transformation Results:
- Total rows processed: 20
- Successfully validated: 20
- Validation errors: 0
- Success rate: 100.0%

✅ Sample Valid Transactions:
1. ID: a1c9830aac6f1ef47e951e935
   Date: 2025-05-28
   Description: Test Purchase 1
   Amount: -123.45 EUR (debit)
```

### Demo 3 Output
```
🚀 Demo 3: Local File Transformation

✅ DuckDB initialized for local file processing
📁 Processing local CSV file: ./test_transactions.csv

🔍 ID Generation Process (Raw Data → Hash):
1. ID Generation:
   Generated ID: a1c9830aac6f1ef47e951e935
   Raw data used: 28.05.2025 | Test Purchase 1 | -123,45 | EUR
   Hash input: "28.05.2025|Test Purchase 1|-123,45|EUR"

🔄 ID Consistency Test:
✅ ID Consistency: PASSED
   Same IDs generated: Yes
```

## Troubleshooting

### S3 Connection Issues
```bash
# Check AWS credentials
aws sts get-caller-identity

# Test S3 access
aws s3 ls s3://accntu/
```

### DuckDB Installation Issues
```bash
# Reinstall DuckDB
bun remove @duckdb/node-api
bun add @duckdb/node-api
```

### Local File Issues
```bash
# Ensure test file exists
ls -la test_transactions.csv

# Check file permissions
chmod 644 test_transactions.csv
```

## Integration with Main Application

These demos can be imported and used in your main application:

```typescript
import { queryS3Demo, transformationS3Demo, localTransformationDemo } from './src/lib/duckdb/demos';

// Use in your application
await transformationS3Demo();
```
