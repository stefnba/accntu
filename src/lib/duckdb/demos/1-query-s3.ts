import dotenv from 'dotenv';
import { DuckDBManager } from '../manager';

// Load environment variables
dotenv.config();

// S3 path to the CSV file
const S3_PATH = 's3://accntu/81955371a28562a18fbb54f33a636781bb7f3b3a4bf94be1b6b1407fec16d1cb';

/**
 * Demo 1: Simple S3 Query (No Transformation)
 *
 * This demo shows how to:
 * - Connect to S3
 * - Read CSV data directly
 * - Display raw results without transformation or validation
 */
async function queryS3Demo() {
    console.log('🚀 Demo 1: Simple S3 Query (No Transformation)\n');

    const manager = new DuckDBManager({
        s3: {
            region: 'us-east-1',
            useCredentialChain: true,
        },
    });

    try {
        await manager.initialize();
        console.log('✅ DuckDB initialized with S3 support');

        // Simple query - just read the data as-is
        console.log('\n📊 Reading CSV data from S3...');
        const result = await manager.readCSVFromS3(S3_PATH, {
            delim: ';',
            skip: 2, // Skip card info header
            header: true,
            all_varchar: true, // Keep everything as strings
        });

        console.log(`✅ Successfully read ${result.rowCount} rows`);
        console.log(`📋 Columns found: ${result.columns.length}`);

        // Show raw data structure
        if (result.rows.length > 0) {
            console.log('\n🔍 First few rows (raw data):');
            console.table(result.rows.slice(0, 5));

            console.log('\n📊 Data Summary:');
            const firstRow = result.rows[0];
            console.log('Available columns:', Object.keys(firstRow));

            // Show some basic statistics
            console.log(`\n📈 Basic Statistics:`);
            console.log(`- Total transactions: ${result.rowCount}`);
            console.log(
                `- Processed transactions: ${result.rows.filter((row) => row['Status'] === 'Processed').length}`
            );
            console.log(
                `- Unique currencies: ${[...new Set(result.rows.map((row) => row['Currency']))].join(', ')}`
            );

            // Show date range
            const dates = result.rows
                .map((row) => row['Authorised on'])
                .filter((date) => date)
                .sort();
            if (dates.length > 0) {
                console.log(`- Date range: ${dates[0]} to ${dates[dates.length - 1]}`);
            }
        }

        // Demonstrate simple SQL queries on the data
        console.log('\n🔍 Running some basic SQL queries...');

        // Count by status
        const statusQuery = `
      SELECT "Status", COUNT(*) as count
      FROM read_csv(${S3_PATH},
                    delim = ';', skip = 2, header = true, all_varchar = true)
      GROUP BY "Status"
      ORDER BY count DESC
    `;
        const statusResult = await manager.query(statusQuery);
        console.log('\n📊 Transactions by Status:');
        console.table(statusResult.rows);

        // Count by currency
        const currencyQuery = `
      SELECT "Currency", COUNT(*) as count
      FROM read_csv(${S3_PATH},
                    delim = ';', skip = 2, header = true, all_varchar = true)
      WHERE "Currency" IS NOT NULL
      GROUP BY "Currency"
      ORDER BY count DESC
    `;
        const currencyResult = await manager.query(currencyQuery);
        console.log('\n💰 Transactions by Currency:');
        console.table(currencyResult.rows);

        console.log('\n✅ Demo completed successfully!');
        console.log(
            '💡 This demo showed raw data reading without any transformation or validation.'
        );
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await manager.cleanup();
        console.log('🧹 Cleanup completed');
    }
}

// Export for use in other files
export { queryS3Demo };

// Run demo if this file is executed directly
if (require.main === module) {
    queryS3Demo().catch(console.error);
}
