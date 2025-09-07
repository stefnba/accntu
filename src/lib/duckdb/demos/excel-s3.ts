import { z } from 'zod';
import { DuckDBTransactionTransformManager as DuckDBManager } from '../index';
import type { ExcelReadOptions } from '../types';

/**
 * Demo: Reading Excel files from S3
 *
 * This example shows how to:
 * - Read Excel files from S3
 * - Work with different sheets
 * - Use cell ranges
 * - Handle headers and data types
 */

async function demoExcelReading() {
    const manager = new DuckDBManager({
        enableHttpfs: true,
        enableExcel: true,
        s3: {
            region: 'us-east-1',
            useCredentialChain: true,
        },
    });

    try {
        await manager.initialize();
        console.log('📊 DuckDB initialized with Excel and S3 support');

        // Example S3 paths (replace with your actual paths)
        const excelS3Path = 's3://your-bucket/data.xlsx';

        // Basic Excel reading
        console.log('\n📈 Reading Excel file from S3...');
        const basicResult = await manager.readExcelFromS3(excelS3Path);
        console.log(`Read ${basicResult.rowCount} rows from Excel file`);
        console.log('Columns:', basicResult.columns);
        console.log('First few rows:', basicResult.rows.slice(0, 3));

        // Reading specific sheet
        console.log('\n📋 Reading specific sheet...');
        const sheetOptions: ExcelReadOptions = {
            sheet: 'Sheet2',
            header: true,
        };
        const sheetResult = await manager.readExcelFromS3(excelS3Path, sheetOptions);
        console.log(`Read ${sheetResult.rowCount} rows from Sheet2`);

        // Reading specific range
        console.log('\n🎯 Reading specific range...');
        const rangeOptions: ExcelReadOptions = {
            range: 'A1:E100', // Read columns A-E, rows 1-100
            header: true,
            stop_at_empty: false, // Continue reading even if empty rows found
        };
        const rangeResult = await manager.readExcelFromS3(excelS3Path, rangeOptions);
        console.log(`Read ${rangeResult.rowCount} rows from range A1:E100`);

        // Advanced options
        console.log('\n⚙️ Reading with advanced options...');
        const advancedOptions: ExcelReadOptions = {
            sheet: 'Data',
            range: 'B5:Z', // Skip first 4 rows and first column
            header: true,
            all_varchar: false, // Let DuckDB infer types
            empty_as_varchar: false, // Treat empty cells as DOUBLE
            ignore_errors: true, // Replace conversion errors with NULL
        };
        const advancedResult = await manager.readExcelFromS3(excelS3Path, advancedOptions);
        console.log(`Read ${advancedResult.rowCount} rows with advanced options`);

        // Create table from Excel
        console.log('\n🏗️ Creating table from Excel...');
        await manager.createTableFromExcel('excel_data', excelS3Path, {
            sheet: 'Sheet1',
            header: true,
        });

        const tableSchema = await manager.getTableSchema('excel_data');
        console.log('Created table schema:', tableSchema.rows);

        // Transform Excel data
        console.log('\n🔄 Transforming Excel data...');
        const transformQuery = `
            SELECT
                *,
                ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) as row_id
            FROM excel_data
            WHERE column_1 IS NOT NULL
            LIMIT 10
        `;
        const transformResult = await manager.query(transformQuery);
        console.log('Transformed data:', transformResult.rows);

        // Use in transformation pipeline
        console.log('\n🔗 Using Excel in transformation pipeline...');
        const pipelineResult = await manager.transformData({
            source: {
                type: 'excel',
                path: excelS3Path,
                options: {
                    sheet: 'Sheet1',
                    header: true,
                    ignore_errors: true,
                } as ExcelReadOptions,
            },
            transformSql: `
                SELECT
                    *
                FROM data
                WHERE column_1 IS NOT NULL
                LIMIT 5
            `,
            schema: z
                .object({
                    column_1: z.any(),
                    column_2: z.any(),
                })
                .passthrough(), // Allow additional columns
        });

        console.log(`Pipeline processed ${pipelineResult.totalRows} rows`);
        console.log('Valid rows:', pipelineResult.validRows);
        console.log('Sample data:', pipelineResult.validatedData.slice(0, 2));
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await manager.cleanup();
    }
}

/**
 * Demo: Excel file analysis
 */
async function demoExcelAnalysis() {
    const manager = new DuckDBManager({
        enableHttpfs: true,
        enableExcel: true,
        s3: {
            region: 'us-east-1',
            useCredentialChain: true,
        },
    });

    try {
        await manager.initialize();

        const excelPath = 's3://your-bucket/sales-data.xlsx';

        // Analyze Excel file structure
        console.log('\n🔍 Analyzing Excel file structure...');

        // Read without options to see what we get
        const sampleResult = await manager.readExcelFromS3(excelPath, {
            range: '1:10', // Just first 10 rows
        });

        console.log('Sample columns:', sampleResult.columns);
        console.log('Sample data types inferred by DuckDB:');

        // Create a temporary table to inspect schema
        await manager.createTableFromExcel('temp_excel', excelPath, {
            range: '1:100', // Sample first 100 rows for type inference
            header: true,
        });

        const schema = await manager.getTableSchema('temp_excel');
        console.log('Inferred schema:', schema.rows);

        // Clean up
        await manager.query('DROP TABLE temp_excel');
    } catch (error) {
        console.error('❌ Analysis error:', error);
    } finally {
        await manager.cleanup();
    }
}

// Export functions for use
export { demoExcelAnalysis, demoExcelReading };

// Run demo if executed directly
if (require.main === module) {
    console.log('🚀 Starting Excel S3 Demo...');
    demoExcelReading()
        .then(() => console.log('✅ Excel demo completed'))
        .catch(console.error);
}
