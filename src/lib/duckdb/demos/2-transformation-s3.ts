import dotenv from 'dotenv';
import { z } from 'zod';
import { DuckDBTransactionTransformManager as DuckDBManager } from '../index';

// Load environment variables
dotenv.config();

/**
 * Demo 2: S3 Data Transformation with Validation
 *
 * This demo shows how to:
 * - Read CSV data from S3
 * - Generate deterministic IDs from raw data
 * - Transform European number/date formats
 * - Validate results with Zod schemas
 * - Handle validation errors gracefully
 */

// Define the expected output schema
const TransactionSchema = z.object({
    id: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
    description: z.string().min(1),
    amount: z.number(),
    currency: z.string().min(1),
    type: z.enum(['debit', 'credit']),
});

type Transaction = z.infer<typeof TransactionSchema>;

async function transformationS3Demo() {
    console.log('🚀 Demo 2: S3 Data Transformation with Validation\n');

    const manager = new DuckDBManager({
        s3: {
            region: 'us-east-1',
            useCredentialChain: true,
        },
    });

    try {
        await manager.initialize();
        console.log('✅ DuckDB initialized with S3 support');

        console.log('\n🔄 Starting transformation process...');

        const result = await manager.transformData<Transaction>(
            {
                source: {
                    type: 'csv',
                    path: 's3://accntu/81955371a28562a18fbb54f33a636781bb7f3b3a4bf94be1b6b1407fec16d1cb',
                    options: {
                        delim: ';',
                        skip: 2, // Skip card info header and empty line
                        header: true,
                        all_varchar: true, // Read everything as strings to prevent auto-parsing
                    },
                },
                // Generate deterministic IDs from raw data before transformation
                idConfig: {
                    columns: ['Authorised on', 'Description', 'Amount', 'Currency'],
                    fieldName: 'id',
                },
                // Transform the European-formatted data to standard formats
                transformSql: `
        SELECT
          id, -- Deterministic ID generated from raw data

          -- Convert DD.MM.YYYY to YYYY-MM-DD
          strftime(strptime("Authorised on", '%d.%m.%Y'), '%Y-%m-%d') as date,

          -- Clean up description
          TRIM("Description") as description,

          -- Convert European number format (1.234,56) to standard decimal
          -- Handle both thousands separator (.) and decimal separator (,)
          CAST(
            REGEXP_REPLACE(
              REGEXP_REPLACE("Amount", '([0-9]+)\\.([0-9]{3})', '\\1\\2'),
              '(-?[0-9]+),([0-9]+)',
              '\\1.\\2'
            ) AS DOUBLE
          ) as amount,

          "Currency" as currency,

          -- Determine transaction type based on amount sign
          CASE
            WHEN CAST(
              REGEXP_REPLACE(
                REGEXP_REPLACE("Amount", '([0-9]+)\\.([0-9]{3})', '\\1\\2'),
                '(-?[0-9]+),([0-9]+)',
                '\\1.\\2'
              ) AS DOUBLE
            ) < 0
            THEN 'debit'
            ELSE 'credit'
          END as type

        FROM data
        WHERE
          "Authorised on" IS NOT NULL
          AND "Amount" IS NOT NULL
          AND "Description" IS NOT NULL
          AND "Status" = 'Processed'  -- Only processed transactions
        ORDER BY strptime("Authorised on", '%d.%m.%Y') DESC
        LIMIT 50  -- Limit for demo
      `,
                schema: TransactionSchema,
            },
            {
                continueOnValidationError: true,
                maxValidationErrors: 10,
                includeInvalidRows: true,
            }
        );

        // Display results
        console.log(`\n📊 Transformation Results:`);
        console.log(`- Total rows processed: ${result.totalRows}`);
        console.log(`- Successfully validated: ${result.validRows}`);
        console.log(`- Validation errors: ${result.validationErrors.length}`);
        console.log(`- Success rate: ${((result.validRows / result.totalRows) * 100).toFixed(1)}%`);

        // Show performance metrics
        console.log(`\n⏱️  Performance Metrics:`);
        console.log(`- Read time: ${result.metrics.readTimeMs}ms`);
        console.log(`- Transform time: ${result.metrics.transformTimeMs}ms`);
        console.log(`- Validation time: ${result.metrics.validationTimeMs}ms`);
        console.log(`- Total time: ${result.metrics.totalTimeMs}ms`);

        // Display sample valid transactions
        if (result.validatedData.length > 0) {
            console.log(`\n✅ Sample Valid Transactions:`);
            result.validatedData.slice(0, 5).forEach((transaction, i) => {
                console.log(`${i + 1}. ID: ${transaction.id}`);
                console.log(`   Date: ${transaction.date}`);
                console.log(`   Description: ${transaction.description}`);
                console.log(
                    `   Amount: ${transaction.amount} ${transaction.currency} (${transaction.type})`
                );
                console.log('');
            });

            // Show transaction type breakdown
            const debitCount = result.validatedData.filter((t) => t.type === 'debit').length;
            const creditCount = result.validatedData.filter((t) => t.type === 'credit').length;
            console.log(`📈 Transaction Type Breakdown:`);
            console.log(`- Debits: ${debitCount} transactions`);
            console.log(`- Credits: ${creditCount} transactions`);

            // Show amount statistics
            const amounts = result.validatedData.map((t) => Math.abs(t.amount));
            const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
            const avgAmount = totalAmount / amounts.length;
            const maxAmount = Math.max(...amounts);
            const minAmount = Math.min(...amounts);

            console.log(`\n💰 Amount Statistics:`);
            console.log(
                `- Total volume: ${totalAmount.toFixed(2)} ${result.validatedData[0]?.currency || 'EUR'}`
            );
            console.log(`- Average amount: ${avgAmount.toFixed(2)}`);
            console.log(`- Max amount: ${maxAmount.toFixed(2)}`);
            console.log(`- Min amount: ${minAmount.toFixed(2)}`);
        }

        // Display validation errors if any
        if (result.validationErrors.length > 0) {
            console.log(`\n❌ Validation Errors (first 3):`);
            result.validationErrors.slice(0, 3).forEach((error, i) => {
                console.log(`\nError ${i + 1} (row ${error.rowIndex}):`);
                console.log(`- Issue: ${error.errors[0]?.message || 'Unknown validation error'}`);
                console.log(`- Field: ${error.errors[0]?.path?.join('.') || 'Unknown field'}`);
                if (error.row && Object.keys(error.row).length > 0) {
                    console.log(`- Raw data: ${JSON.stringify(error.row, null, 2)}`);
                }
            });
        }

        console.log('\n✅ Transformation demo completed!');
        console.log('💡 This demo showed:');
        console.log('  - Reading CSV from S3');
        console.log('  - Generating deterministic IDs from raw data');
        console.log('  - Converting European date/number formats');
        console.log('  - Validating with Zod schemas');
        console.log('  - Handling validation errors gracefully');
    } catch (error) {
        console.error('❌ Error during transformation:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        }
    } finally {
        await manager.cleanup();
        console.log('🧹 Cleanup completed');
    }
}

// Export for use in other files
export { transformationS3Demo };

// Run demo if this file is executed directly
if (require.main === module) {
    transformationS3Demo().catch(console.error);
}
