import dotenv from 'dotenv';
import { DuckDBManager } from './manager';

// Load environment variables from .env file
dotenv.config();

// Example usage
(async () => {
    const db = new DuckDBManager({
        database: ':memory:',
        s3: {
            region: process.env.AWS_BUCKET_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            endpoint: process.env.AWS_BUCKET_REGION
                ? `s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com`
                : undefined,
            useCredentialChain: false, // Set to true to use AWS credential chain instead
        },
    });

    try {
        await db.initialize();

        console.log('\nTesting with specific CSV options...');
        const s3ResultWithOptions = await db.readCSVFromS3(
            's3://accntu/81955371a28562a18fbb54f33a636781bb7f3b3a4bf94be1b6b1407fec16d1cb',
            {
                delim: ';', // Semicolon separator
                header: true,
                sample_size: 5, // Read only 5 rows for demo
                all_varchar: true, // All columns as VARCHAR
                normalize_names: true, // Clean column names
            }
        );

        console.log(`S3 CSV Result with options: ${s3ResultWithOptions.rowCount} rows loaded`);
        console.log('Sample rows:', s3ResultWithOptions.rows);

        // Create a table from S3 CSV (using auto-detection)
        await db.createTableFromCSV(
            'transactions',
            's3://accntu/81955371a28562a18fbb54f33a636781bb7f3b3a4bf94be1b6b1407fec16d1cb'
            // No options - auto-detection works best for this file
        );

        // Query the created table
        const transactionData = await db.query(
            'SELECT COUNT(*) as total_transactions FROM transactions'
        );
        console.log('Transaction count:', transactionData.rows[0]);

        // Example: Get DuckDB info including secrets
        const info = await db.getInfo();
        console.log('DuckDB Info:', {
            version: info.version,
            secretsCount: info.secrets.length,
            s3ConfiguredSettings: info.s3Settings.filter((s: any) => s.value !== '').length,
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.cleanup();
    }
})();
