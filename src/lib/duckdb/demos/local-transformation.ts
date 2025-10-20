import { z } from 'zod';
import { DuckDBTransactionTransformSingleton as DuckDBManager } from '../../duckdb';

// Transaction schema with ID field
const TransactionSchema = z.object({
    id: z.string(),
    date: z.string(),
    description: z.string(),
    amount: z.number(),
    currency: z.string(),
    type: z.enum(['debit', 'credit']),
});

type Transaction = z.infer<typeof TransactionSchema>;

(async () => {
    const manager = await DuckDBManager.getInstance();

    try {
        await manager.initialize();
        console.log('✅ DuckDB initialized successfully');

        // Transform with ID generation based on raw column names
        const result = await manager.transformData<Transaction>({
            source: {
                type: 'csv',
                path: './test_transactions.csv',
                options: {
                    delim: ';',
                    skip: 2, // Skip card info and empty line
                    header: true,
                    all_varchar: true, // Read everything as strings first
                },
            },
            // Generate ID from raw column names (before transformation)
            idConfig: {
                columns: ['Authorised on', 'Description', 'Amount', 'Currency'], // Raw CSV column names
                fieldName: 'id',
            },
            // Transform the data with the ID already available
            transformSql: `
        SELECT
          id, -- ID generated from raw data
          strftime(strptime("Authorised on", '%d.%m.%Y'), '%Y-%m-%d') as date,
          TRIM("Description") as description,
          CAST(REPLACE("Amount", ',', '.') AS DOUBLE) as amount,
          "Currency" as currency,
          CASE
            WHEN CAST(REPLACE("Amount", ',', '.') AS DOUBLE) < 0
            THEN 'debit'
            ELSE 'credit'
          END as type,
          -- Include raw columns for demo purposes
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

        console.log(`\n📊 Transformation Results:`);
        console.log(`Total rows processed: ${result.totalRows}`);
        console.log(`Valid rows: ${result.validRows}`);
        console.log(`Validation errors: ${result.validationErrors.length}`);
        console.log(`Success rate: ${((result.validRows / result.totalRows) * 100).toFixed(1)}%`);

        if (result.validRows > 0) {
            console.log(`\n🔍 Sample transactions with generated IDs:`);
            result.validatedData.forEach((transaction, i) => {
                console.log(`${i + 1}. ID: ${transaction.id}`);
                console.log(`   Date: ${transaction.date}`);
                console.log(`   Description: ${transaction.description}`);
                console.log(`   Amount: ${transaction.amount} ${transaction.currency}`);
                console.log(`   Type: ${transaction.type}`);
                console.log('');
            });

            // Show the raw data to demonstrate ID generation
            console.log(`\n🔍 Raw data with generated IDs:`);
            result.data.forEach((row, i) => {
                console.log(`${i + 1}. Raw ID: ${row.id}`);
                console.log(
                    `   Raw columns used: ${row.raw_date} | ${row.raw_description} | ${row.raw_amount} | ${row.raw_currency}`
                );
                console.log('');
            });
        }

        if (result.validationErrors.length > 0) {
            console.log(`\n❌ First validation error:`);
            console.log(result.validationErrors[0].errors[0].message);
        }

        console.log(`\n⏱️  Performance Metrics:`);
        console.log(`Read time: ${result.metrics.readTimeMs}ms`);
        console.log(`Transform time: ${result.metrics.transformTimeMs}ms`);
        console.log(`Validation time: ${result.metrics.validationTimeMs}ms`);
        console.log(`Total time: ${result.metrics.totalTimeMs}ms`);
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await manager.cleanup();
        console.log('🧹 Cleanup completed');
    }
})();
