/**
 * Performance Benchmark Demo for Array Processing Methods
 *
 * This demo compares the performance of different approaches for processing JavaScript arrays:
 * 1. JSON VALUES approach (queryArrayObjectsJSON) - good for small datasets
 * 2. Temporary table approach (queryArrayObjectsTable) - better for large datasets
 * 3. Smart approach (queryArrayObjects) - automatically chooses best method
 *
 * Tests with various dataset sizes to find optimal thresholds and performance characteristics.
 */

import { DuckDBCore } from '../core';
import type { DuckDBConfig } from '../types';

// Test data generator
function generateTestData(size: number): Array<{
    id: number;
    name: string;
    amount: number;
    category: string;
    date: string;
    description: string;
}> {
    const categories = ['food', 'transport', 'entertainment', 'utilities', 'healthcare'];
    const data = [];

    for (let i = 0; i < size; i++) {
        data.push({
            id: i + 1,
            name: `Transaction ${i + 1}`,
            amount: Math.round((Math.random() * 1000 + 10) * 100) / 100,
            category: categories[Math.floor(Math.random() * categories.length)],
            date: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
                .toISOString()
                .split('T')[0],
            description: `Sample transaction description ${i + 1} with some additional text to make it realistic`,
        });
    }

    return data;
}

// Benchmark function
async function benchmarkMethod(
    duckdb: DuckDBCore,
    method: string,
    data: any[],
    sql: string,
    iterations: number = 3
): Promise<{
    method: string;
    avgTimeMs: number;
    minTimeMs: number;
    maxTimeMs: number;
    rowsProcessed: number;
    rowsReturned: number;
}> {
    const times: number[] = [];
    let resultRows = 0;

    for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();

        let result;
        switch (method) {
            case 'JSON':
                result = await duckdb.queryArrayObjectsJSON(data, sql);
                break;
            case 'NATIVE':
                result = await duckdb.queryArrayObjectsNative(data, sql);
                break;
            case 'FILE':
                result = await duckdb.queryArrayObjectsViaFile(data, sql);
                break;
            case 'ENHANCED':
                result = await duckdb.queryArrayObjectsEnhanced(data, sql);
                break;
            case 'SMART':
                result = await duckdb.queryArrayObjects(data, sql);
                break;
            default:
                throw new Error(`Unknown method: ${method}`);
        }

        const endTime = performance.now();
        times.push(endTime - startTime);
        resultRows = result.rowCount;
    }

    return {
        method,
        avgTimeMs: Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 100) / 100,
        minTimeMs: Math.round(Math.min(...times) * 100) / 100,
        maxTimeMs: Math.round(Math.max(...times) * 100) / 100,
        rowsProcessed: data.length,
        rowsReturned: resultRows,
    };
}

// Format results table
function formatResults(results: any[]): void {
    console.log('\n📊 Performance Benchmark Results\n');
    console.log(
        'Size    | Method | Avg Time | Min Time | Max Time | Rows In | Rows Out | Performance Rating'
    );
    console.log(
        '--------|--------|----------|----------|----------|---------|----------|------------------'
    );

    const groupedResults = results.reduce((acc, result) => {
        const key = result.rowsProcessed;
        if (!acc[key]) acc[key] = [];
        acc[key].push(result);
        return acc;
    }, {});

    Object.keys(groupedResults)
        .sort((a, b) => Number(a) - Number(b))
        .forEach((size) => {
            const sizeResults = groupedResults[size];
            const fastest = sizeResults.reduce(
                (min: { avgTimeMs: number }, r: { avgTimeMs: number }) =>
                    r.avgTimeMs < min.avgTimeMs ? r : min
            );

            sizeResults.forEach((result: any) => {
                const rating =
                    result.avgTimeMs === fastest.avgTimeMs
                        ? '🥇 FASTEST'
                        : result.avgTimeMs < fastest.avgTimeMs * 1.5
                          ? '🥈 GOOD'
                          : result.avgTimeMs < fastest.avgTimeMs * 3
                            ? '🥉 OK'
                            : '❌ SLOW';

                console.log(
                    `${size.padStart(7)} | ${result.method.padStart(6)} | ${result.avgTimeMs.toString().padStart(8)}ms | ${result.minTimeMs.toString().padStart(8)}ms | ${result.maxTimeMs.toString().padStart(8)}ms | ${result.rowsProcessed.toString().padStart(7)} | ${result.rowsReturned.toString().padStart(8)} | ${rating}`
                );
            });

            if (
                Object.keys(groupedResults).indexOf(size) <
                Object.keys(groupedResults).length - 1
            ) {
                console.log(
                    '--------|--------|----------|----------|----------|---------|----------|------------------'
                );
            }
        });
}

// Memory usage monitoring
function getMemoryUsage(): { used: number; total: number } {
    const usage = process.memoryUsage();
    return {
        used: Math.round((usage.heapUsed / 1024 / 1024) * 100) / 100, // MB
        total: Math.round((usage.heapTotal / 1024 / 1024) * 100) / 100, // MB
    };
}

async function runPerformanceBenchmark() {
    console.log('🚀 Starting DuckDB Array Processing Performance Benchmark\n');

    const config: DuckDBConfig = {
        database: ':memory:',
    };

    const duckdb = new DuckDBCore(config);

    try {
        await duckdb.initialize();
        console.log('✅ DuckDB initialized\n');

        // Test different dataset sizes
        const testSizes = [50, 100, 500, 1000, 2500, 5000, 10000];
        const testQueries = [
            'SELECT COUNT(*) as total_count FROM data',
            'SELECT category, COUNT(*) as count, AVG(amount) as avg_amount FROM data GROUP BY category',
            "SELECT * FROM data WHERE amount > 100 AND category = 'food' ORDER BY amount DESC LIMIT 10",
        ];

        for (const queryIndex in testQueries) {
            const sql = testQueries[queryIndex];
            const queryName = ['COUNT Query', 'GROUP BY Query', 'FILTER & ORDER Query'][queryIndex];

            console.log(`\n🔍 Testing: ${queryName}`);
            console.log(`SQL: ${sql}\n`);

            const results: any[] = [];

            for (const size of testSizes) {
                console.log(`⏳ Generating test data (${size.toLocaleString()} rows)...`);
                const testData = generateTestData(size);

                const memBefore = getMemoryUsage();
                console.log(
                    `📊 Memory before: ${memBefore.used}MB used, ${memBefore.total}MB total`
                );

                // Test each method
                const methods = ['JSON', 'NATIVE', 'FILE', 'ENHANCED', 'SMART'];

                for (const method of methods) {
                    console.log(`   Testing ${method} method...`);
                    try {
                        const result = await benchmarkMethod(duckdb, method, testData, sql, 3);
                        results.push(result);
                    } catch (error: any) {
                        console.log(`   ❌ ${method} method failed:`, error.message);
                        results.push({
                            method,
                            avgTimeMs: -1,
                            minTimeMs: -1,
                            maxTimeMs: -1,
                            rowsProcessed: size,
                            rowsReturned: 0,
                        });
                    }
                }

                const memAfter = getMemoryUsage();
                console.log(`📊 Memory after: ${memAfter.used}MB used, ${memAfter.total}MB total`);
                console.log(`📈 Memory delta: +${(memAfter.used - memBefore.used).toFixed(2)}MB\n`);
            }

            formatResults(results);
        }

        // Special test: Memory efficiency with very large dataset
        console.log('\n🧪 Memory Efficiency Test (20,000 rows)\n');
        const largeData = generateTestData(20000);

        console.log('Testing memory usage patterns...');
        const memBefore = getMemoryUsage();

        try {
            console.log('⏳ JSON approach...');
            const jsonStart = performance.now();
            const jsonResult = await duckdb.queryArrayObjectsJSON(
                largeData,
                'SELECT COUNT(*) FROM data',
                'data'
            );
            const jsonTime = performance.now() - jsonStart;
            const memAfterJson = getMemoryUsage();

            console.log('⏳ Native approach...');
            const nativeStart = performance.now();
            const nativeResult = await duckdb.queryArrayObjectsNative(
                largeData,
                'SELECT COUNT(*) FROM data',
                'data'
            );
            const nativeTime = performance.now() - nativeStart;
            const memAfterNative = getMemoryUsage();

            console.log('\n📊 Large Dataset Results:');
            console.log(
                `JSON approach:   ${jsonTime.toFixed(2)}ms, Memory: +${(memAfterJson.used - memBefore.used).toFixed(2)}MB`
            );
            console.log(
                `Native approach: ${nativeTime.toFixed(2)}ms, Memory: +${(memAfterNative.used - memAfterJson.used).toFixed(2)}MB`
            );
            console.log(
                `Result match: ${JSON.stringify(jsonResult.rows) === JSON.stringify(nativeResult.rows) ? '✅ IDENTICAL' : '❌ DIFFERENT'}`
            );
        } catch (error: any) {
            console.log('❌ Large dataset test failed:', error.message);
        }

        // Recommendations based on results
        // Test the new streaming approach for very large datasets
        console.log('\n🌊 Testing Streaming Approach (50,000 rows)\n');
        const veryLargeData = generateTestData(50000);

        console.log('Testing streaming approach for very large datasets...');
        const streamMemBefore = getMemoryUsage();

        try {
            console.log('⏳ Stream approach...');
            const streamStart = performance.now();
            const streamResult = await duckdb.loadLargeArrayViaStream(veryLargeData, 'stream_test');
            const streamTime = performance.now() - streamStart;
            const streamMemAfter = getMemoryUsage();

            console.log(
                `🌊 Stream approach: ${streamTime.toFixed(2)}ms, Memory: +${(streamMemAfter.used - streamMemBefore.used).toFixed(2)}MB`
            );
            console.log(`📊 Rows loaded: ${streamResult.rows[0]?.rows_loaded || 'unknown'}`);

            // Clean up
            await duckdb.query('DROP TABLE IF EXISTS stream_test');
        } catch (error: any) {
            console.log('❌ Stream test failed:', error.message);
        }

        console.log('\n💡 Performance Recommendations:\n');
        console.log('📋 Based on the benchmark results:');
        console.log(
            '   • Use JSON approach for datasets < 500 rows (lower overhead, simple VALUES clause)'
        );
        console.log(
            '   • Use NATIVE approach for datasets ≥ 500 rows (efficient JSON-to-table creation)'
        );
        console.log('   • Use STREAMING approach for datasets > 50,000 rows (memory efficient)');
        console.log('   • The SMART method automatically chooses the optimal approach');
        console.log('   • Memory usage grows linearly with dataset size');
        console.log('   • Both approaches avoid JavaScript loops in SQL generation');
        console.log('\n🔧 Configuration Tips:');
        console.log('   • Adjust the 500 row threshold in queryArrayObjects() if needed');
        console.log('   • Use loadLargeArrayViaStream() for datasets > 50,000 rows');
        console.log('   • Use loadFromApiJson() for large API responses');
        console.log('   • Monitor memory usage in production environments');
        console.log("   • NATIVE approach uses DuckDB's JSON processing internally");
        console.log('   • STREAMING approach uses temporary files with read_json_auto');
    } catch (error: any) {
        console.error('❌ Benchmark failed:', error);
    } finally {
        await duckdb.cleanup();
        console.log('\n🧹 Cleanup completed');
    }
}

// Run the benchmark
if (require.main === module) {
    runPerformanceBenchmark().catch(console.error);
}

export { benchmarkMethod, generateTestData, runPerformanceBenchmark };
