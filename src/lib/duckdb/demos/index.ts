/**
 * DuckDB Demos Index
 *
 * This file provides easy access to all DuckDB demonstration scripts.
 * Each demo showcases different aspects of the DuckDB integration.
 */

// Import all demo functions
import { queryS3Demo } from './1-query-s3';
import { transformationS3Demo } from './2-transformation-s3';
import { localTransformationDemo } from './3-local-transformation';

// Export individual demos
export { localTransformationDemo, queryS3Demo, transformationS3Demo };

/**
 * Run all demos in sequence
 */
export async function runAllDemos() {
    console.log('🚀 Running All DuckDB Demos\n');
    console.log('='.repeat(60));

    try {
        // Demo 1: Simple S3 Query
        console.log('\n🔍 Starting Demo 1: Simple S3 Query');
        await queryS3Demo();

        console.log('\n' + '='.repeat(60));

        // Demo 2: S3 Transformation
        console.log('\n🔄 Starting Demo 2: S3 Transformation');
        await transformationS3Demo();

        console.log('\n' + '='.repeat(60));

        // Demo 3: Local Transformation
        console.log('\n📁 Starting Demo 3: Local Transformation');
        await localTransformationDemo();

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ All demos completed successfully!');
    } catch (error) {
        console.error('\n❌ Demo sequence failed:', error);
        throw error;
    }
}

/**
 * Interactive demo selector
 */
export async function runDemo(demoNumber: 1 | 2 | 3) {
    switch (demoNumber) {
        case 1:
            console.log('🔍 Running Demo 1: Simple S3 Query');
            await queryS3Demo();
            break;
        case 2:
            console.log('🔄 Running Demo 2: S3 Transformation');
            await transformationS3Demo();
            break;
        case 3:
            console.log('📁 Running Demo 3: Local Transformation');
            await localTransformationDemo();
            break;
        default:
            throw new Error(`Invalid demo number: ${demoNumber}. Must be 1, 2, or 3.`);
    }
}

// Run all demos if this file is executed directly
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        // No arguments - run all demos
        runAllDemos().catch(console.error);
    } else if (args[0] === '--help' || args[0] === '-h') {
        // Show help
        console.log('DuckDB Demos');
        console.log('=============');
        console.log('');
        console.log('Usage:');
        console.log('  node --import tsx src/lib/duckdb/demos/index.ts [demo_number]');
        console.log('');
        console.log('Demo Numbers:');
        console.log('  1 - Simple S3 Query (no transformation)');
        console.log('  2 - S3 Data Transformation with validation');
        console.log('  3 - Local file transformation');
        console.log('');
        console.log('Examples:');
        console.log('  node --import tsx src/lib/duckdb/demos/index.ts     # Run all demos');
        console.log('  node --import tsx src/lib/duckdb/demos/index.ts 1   # Run demo 1 only');
        console.log('  node --import tsx src/lib/duckdb/demos/index.ts 2   # Run demo 2 only');
        console.log('  node --import tsx src/lib/duckdb/demos/index.ts 3   # Run demo 3 only');
    } else {
        // Run specific demo
        const demoNumber = parseInt(args[0]) as 1 | 2 | 3;
        if (demoNumber >= 1 && demoNumber <= 3) {
            runDemo(demoNumber).catch(console.error);
        } else {
            console.error('❌ Invalid demo number. Use 1, 2, or 3.');
            console.error('Use --help for usage information.');
            process.exit(1);
        }
    }
}
