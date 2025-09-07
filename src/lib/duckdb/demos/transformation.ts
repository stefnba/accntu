import dotenv from 'dotenv';
import { z } from 'zod';
import { DuckDBTransactionTransformManager as DuckDBManager } from '../index';

// Load environment variables
dotenv.config();

const TransactionType = z.enum(['debit', 'credit']);

// Example schema for transaction data
const TransactionSchema = z.object({
    date: z.string(),
    description: z.string(),
    amount: z.number(),
    currency: z.string(),
    type: TransactionType,
});

type Transaction = z.infer<typeof TransactionSchema>;

/**
 * Demo: Transform CSV data from S3 with Zod validation
 * This example shows the CTE approach where user SQL references 'data'
 */
async function demonstrateTransformation() {
    console.log('🚀 DuckDB Transformation Demo\n');

    const db = new DuckDBManager({
        enableHttpfs: true,
        s3: {
            region: process.env.AWS_BUCKET_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            endpoint: `s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com`,
        },
    });

    try {
        await db.initialize();
        console.log('✅ DuckDB initialized successfully');

        // Example 1: Basic transformation
        console.log('\n📊 Example 1: Basic Transformation');
        const result = await db.transformData(
            {
                source: {
                    type: 'csv',
                    path: 's3://accntu/81955371a28562a18fbb54f33a636781bb7f3b3a4bf94be1b6b1407fec16d1cb',
                    options: {
                        delim: ';',
                        normalize_names: true,
                        skip: 2, // Skip the card info header and empty line
                        header: true,
                        all_varchar: true, // Force all columns to be VARCHAR to prevent auto date parsing
                    },
                },
                idConfig: {
                    columns: ['authorised_on', 'description', 'amount', 'currency'],
                    fieldName: 'id',
                },
                // Transform the credit card CSV data
                transformSql: `
          SELECT
            id,
            -- Convert date from DD.MM.YYYY to YYYY-MM-DD format
            strftime(strptime(authorised_on, '%d.%m.%Y'), '%Y-%m-%d') as date,

            -- Clean up description
            TRIM(description) as description,

            -- Convert European number format to standard decimal, then to DOUBLE
            -- First remove thousands separator (.), then replace decimal separator (,) with (.)
            CAST(
              REGEXP_REPLACE(
                REGEXP_REPLACE(amount, '([0-9]+)\\.([0-9]{3})', '\\1\\2'),
                '(-?[0-9]+),([0-9]+)',
                '\\1.\\2'
              ) AS DOUBLE
            ) as amount,

            -- Currency
            currency,

            -- Determine transaction type based on amount (negative = debit, positive = credit)
            CASE
              WHEN CAST(
                REGEXP_REPLACE(
                  REGEXP_REPLACE(amount, '([0-9]+)\\.([0-9]{3})', '\\1\\2'),
                  '(-?[0-9]+),([0-9]+)',
                  '\\1.\\2'
                ) AS DOUBLE
              ) < 0
              THEN 'debit'::VARCHAR
              ELSE 'credit'::VARCHAR
            END as type

          FROM data
          WHERE
            -- Filter out empty rows and ensure we have valid data
            authorised_on IS NOT NULL
            AND amount IS NOT NULL
            AND description IS NOT NULL
            AND status = 'Processed'  -- Only processed transactions
          ORDER BY strptime(authorised_on, '%d.%m.%Y') DESC
          LIMIT 20  -- Limit for demo
        `,
                schema: TransactionSchema,
            },
            {
                continueOnValidationError: true, // Continue processing even if some rows fail
                maxValidationErrors: 10,
            }
        );

        console.log(`\n📊 Transformation Results:`);
        console.log(`Total rows processed: ${result.totalRows}`);
        console.log(`Valid rows: ${result.validRows}`);
        console.log(`Validation errors: ${result.validationErrors.length}`);
        console.log(`Success rate: ${((result.validRows / result.totalRows) * 100).toFixed(1)}%`);

        if (result.validatedData.length > 0) {
            console.log('\n📋 Sample validated transactions:');
            console.table(result.validatedData.slice(0, 5));
        }

        if (result.validationErrors.length > 0) {
            console.log('\n❌ Validation errors:');
            result.validationErrors.slice(0, 3).forEach((error, i) => {
                console.log(`Error ${i + 1} (row ${error.rowIndex}):`, error.errors[0]?.message);
                console.log('Raw row data:', error.row);
            });
        }

        // Show raw data for debugging
        console.log('\n🔍 Raw data sample (first 3 rows):');
        console.table(result.data.slice(0, 3));
    } catch (error) {
        console.error('❌ Demo failed:', error);
    } finally {
        await db.cleanup();
        console.log('\n🧹 Cleanup completed');
    }
}

// Main demo function
async function runDemo() {
    await demonstrateTransformation();
}

// Export for use in other files
export { demonstrateTransformation, runDemo };

// Run demo if this file is executed directly
if (require.main === module) {
    runDemo().catch(console.error);
}
