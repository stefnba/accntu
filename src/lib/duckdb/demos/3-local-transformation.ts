import { z } from 'zod';
import { DuckDBManager } from '../manager';

const LOCAL_FILE_PATH = 'src/lib/duckdb/demos/test_transactions.csv';

/**
 * Demo 3: Local File Transformation
 *
 * This demo shows how to:
 * - Work with local CSV files (no S3 required)
 * - Generate deterministic IDs from raw column data
 * - Transform European number formats
 * - Validate data with Zod schemas
 * - Display detailed results and raw data
 */

// Define the transaction schema
const TransactionSchema = z.object({
    id: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
    description: z.string().min(1),
    amount: z.number(),
    currency: z.string().min(1),
    type: z.enum(['debit', 'credit']),
});

type Transaction = z.infer<typeof TransactionSchema>;

async function localTransformationDemo() {
    console.log('🚀 Demo 3: Local File Transformation\n');

    const manager = new DuckDBManager({
        enableHttpfs: false, // No S3 needed for local files
    });

    try {
        await manager.initialize();
        console.log('✅ DuckDB initialized for local file processing');

        console.log('\n📁 Processing local CSV file: src/lib/duckdb/demos/test_transactions.csv');

        // Transform with ID generation based on raw column names
        const result = await manager.transformData<Transaction>({
            source: {
                type: 'csv',
                path: LOCAL_FILE_PATH,
                options: {
                    delim: ';',
                    skip: 2, // Skip card info header and empty line
                    header: true,
                    all_varchar: true, // Read everything as strings first
                },
            },
            // Generate deterministic IDs from raw column names (before transformation)
            idConfig: {
                columns: ['Authorised on', 'Description', 'Amount', 'Currency'],
                fieldName: 'id',
            },
            // Transform the data with the ID already available
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
          END as type,

          -- Include raw columns for demonstration
          "Authorised on" as raw_date,
          "Description" as raw_description,
          "Amount" as raw_amount,
          "Currency" as raw_currency

        FROM data
        WHERE "Authorised on" IS NOT NULL
          AND "Amount" IS NOT NULL
          AND "Description" IS NOT NULL
          AND "Status" = 'Processed'
      `,
            schema: TransactionSchema,
        });

        // Display comprehensive results
        console.log(`\n📊 Transformation Results:`);
        console.log(`- Total rows processed: ${result.totalRows}`);
        console.log(`- Successfully validated: ${result.validRows}`);
        console.log(`- Validation errors: ${result.errors.length}`);
        console.log(`- Success rate: ${((result.validRows / result.totalRows) * 100).toFixed(1)}%`);

        // Show performance metrics
        console.log(`\n⏱️  Performance Metrics:`);
        console.log(`- Read time: ${result.metrics.readTimeMs}ms`);
        console.log(`- Transform time: ${result.metrics.transformTimeMs}ms`);
        console.log(`- Validation time: ${result.metrics.validationTimeMs}ms`);
        console.log(`- Total time: ${result.metrics.totalTimeMs}ms`);

        // Display validated transactions with details
        if (result.validRows > 0) {
            console.log(`\n✅ Validated Transactions with Generated IDs:`);
            result.validatedData.forEach((transaction, i) => {
                console.log(`\n${i + 1}. Transaction Details:`);
                console.log(`   ID: ${transaction.id}`);
                console.log(`   Date: ${transaction.date}`);
                console.log(`   Description: ${transaction.description}`);
                console.log(`   Amount: ${transaction.amount} ${transaction.currency}`);
                console.log(`   Type: ${transaction.type}`);
            });

            // Show the deterministic ID generation process
            console.log(`\n🔍 ID Generation Process (Raw Data → Hash):`);
            result.data.forEach((row, i) => {
                console.log(`\n${i + 1}. ID Generation:`);
                console.log(`   Generated ID: ${row.id}`);
                console.log(
                    `   Raw data used: ${row.raw_date} | ${row.raw_description} | ${row.raw_amount} | ${row.raw_currency}`
                );
                console.log(
                    `   Hash input: "${row.raw_date}|${row.raw_description}|${row.raw_amount}|${row.raw_currency}"`
                );
            });

            // Transaction analysis
            const debits = result.validatedData.filter((t) => t.type === 'debit');
            const credits = result.validatedData.filter((t) => t.type === 'credit');

            console.log(`\n📈 Transaction Analysis:`);
            console.log(`- Debit transactions: ${debits.length}`);
            console.log(`- Credit transactions: ${credits.length}`);

            if (debits.length > 0) {
                const totalDebits = debits.reduce((sum, t) => sum + Math.abs(t.amount), 0);
                console.log(
                    `- Total debit amount: ${totalDebits.toFixed(2)} ${debits[0].currency}`
                );
            }

            if (credits.length > 0) {
                const totalCredits = credits.reduce((sum, t) => sum + t.amount, 0);
                console.log(
                    `- Total credit amount: ${totalCredits.toFixed(2)} ${credits[0].currency}`
                );
            }

            // Show ID consistency test
            console.log(`\n🔄 ID Consistency Test:`);
            console.log('Running the same transformation again to verify ID consistency...');

            const secondResult = await manager.transformData<Transaction>({
                source: {
                    type: 'csv',
                    path: 'src/lib/duckdb/demos/test_transactions.csv',
                    options: {
                        delim: ';',
                        skip: 2,
                        header: true,
                        all_varchar: true,
                    },
                },
                idConfig: {
                    columns: ['Authorised on', 'Description', 'Amount', 'Currency'],
                    fieldName: 'id',
                },
                transformSql: `
          SELECT
            id,
            strftime(strptime("Authorised on", '%d.%m.%Y'), '%Y-%m-%d') as date,
            TRIM("Description") as description,
            CAST(
              REGEXP_REPLACE(
                REGEXP_REPLACE("Amount", '([0-9]+)\\.([0-9]{3})', '\\1\\2'),
                '(-?[0-9]+),([0-9]+)',
                '\\1.\\2'
              ) AS DOUBLE
            ) as amount,
            "Currency" as currency,
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
          WHERE "Authorised on" IS NOT NULL
            AND "Amount" IS NOT NULL
            AND "Description" IS NOT NULL
            AND "Status" = 'Processed'
        `,
                schema: TransactionSchema,
            });

            // Verify IDs are identical
            const idsMatch = result.validatedData.every(
                (t1, i) => t1.id === secondResult.validatedData[i]?.id
            );

            console.log(`✅ ID Consistency: ${idsMatch ? 'PASSED' : 'FAILED'}`);
            console.log(`   Same IDs generated: ${idsMatch ? 'Yes' : 'No'}`);
            console.log(`   First run IDs: [${result.validatedData.map((t) => t.id).join(', ')}]`);
            console.log(
                `   Second run IDs: [${secondResult.validatedData.map((t) => t.id).join(', ')}]`
            );
        }

        // Display validation errors if any
        if (result.errors.length > 0) {
            console.log(`\n❌ Validation Errors:`);
            result.errors.forEach((error, i) => {
                console.log(`\nError ${i + 1} (row ${error.rowIndex}):`);
                console.log(
                    `- Issue: ${error.error.issues[0]?.message || 'Unknown validation error'}`
                );
                console.log(
                    `- Field: ${error.error.issues[0]?.path?.join('.') || 'Unknown field'}`
                );
                if (error.row && Object.keys(error.row).length > 0) {
                    console.log(`- Raw data: ${JSON.stringify(error.row, null, 2)}`);
                }
            });
        }

        console.log('\n✅ Local transformation demo completed!');
        console.log('💡 This demo demonstrated:');
        console.log('  - Processing local CSV files');
        console.log('  - Generating deterministic IDs from raw column data');
        console.log('  - Converting European number formats');
        console.log('  - Zod schema validation');
        console.log('  - ID consistency across multiple runs');
        console.log('  - Detailed transformation analysis');
    } catch (error) {
        console.error('❌ Error during local transformation:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        }
    } finally {
        await manager.cleanup();
        console.log('🧹 Cleanup completed');
    }
}

// Export for use in other files
export { localTransformationDemo };

// Run demo if this file is executed directly
if (require.main === module) {
    localTransformationDemo().catch(console.error);
}
