/**
 * File-Based Processing Demo for DuckDB
 * 
 * This demo shows how to use the new file-based approach for processing
 * JavaScript objects and JSON data using DuckDB's read_json_auto function.
 */

import { DuckDBCore } from '../core';

// Generate test data
function generateTestData(size: number) {
    const categories = ['food', 'transport', 'entertainment', 'utilities', 'healthcare'];
    const data = [];
    
    for (let i = 0; i < size; i++) {
        data.push({
            id: i + 1,
            name: `Transaction ${i + 1}`,
            amount: Math.round((Math.random() * 1000 + 10) * 100) / 100,
            category: categories[Math.floor(Math.random() * categories.length)],
            date: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
            active: Math.random() > 0.1 // 90% active
        });
    }
    
    return data;
}

async function runFileBenchmark() {
    console.log('📁 DuckDB File-Based Processing Demo\n');
    
    const duckdb = new DuckDBCore();
    
    try {
        await duckdb.initialize();
        console.log('✅ DuckDB initialized\n');
        
        // Demo 1: Basic file-based loading
        console.log('📊 Demo 1: Basic File-Based Loading');
        const data = generateTestData(5000);
        console.log(`Generated ${data.length.toLocaleString()} rows of test data`);
        
        const loadStart = performance.now();
        const loadResult = await duckdb.loadFromTempFile(data, 'file_test_table');
        const loadEnd = performance.now();
        
        console.log(`✅ File-based loading: ${(loadEnd - loadStart).toFixed(2)}ms`);
        console.log(`📈 Rows loaded: ${loadResult.rows[0]?.rows_loaded || 'unknown'}`);
        
        // Demo 2: File-based querying
        console.log('\n🔍 Demo 2: File-Based Querying');
        const queryData = generateTestData(10000);
        
        const queryStart = performance.now();
        const queryResult = await duckdb.queryArrayObjectsViaFile(
            queryData,
            'SELECT category, COUNT(*) as count, AVG(amount) as avg_amount FROM data GROUP BY category ORDER BY count DESC'
        );
        const queryEnd = performance.now();
        
        console.log(`✅ File-based query: ${(queryEnd - queryStart).toFixed(2)}ms`);
        console.log('🔍 Query results:', queryResult.rows);
        
        // Demo 3: Enhanced smart selection
        console.log('\n🧠 Demo 3: Enhanced Smart Selection');
        
        const testSizes = [100, 1000, 10000, 150000];
        const testMethods = ['json', 'native', 'file'] as const;
        
        for (const size of testSizes) {
            console.log(`\n📊 Testing ${size.toLocaleString()} rows:`);
            const testData = generateTestData(size);
            
            for (const method of testMethods) {
                try {
                    const start = performance.now();
                    const result = await duckdb.queryArrayObjectsEnhanced(
                        testData,
                        'SELECT COUNT(*) as total FROM data',
                        'data',
                        { forceMethod: method }
                    );
                    const end = performance.now();
                    
                    console.log(`   ${method.toUpperCase().padEnd(6)}: ${(end - start).toFixed(2)}ms (${result.rows[0]?.total || 'unknown'} rows)`);
                } catch (error) {
                    console.log(`   ${method.toUpperCase().padEnd(6)}: ❌ Failed - ${error.message}`);
                }
            }
            
            // Test auto selection
            try {
                const autoStart = performance.now();
                const autoResult = await duckdb.queryArrayObjectsEnhanced(
                    testData,
                    'SELECT COUNT(*) as total FROM data'
                );
                const autoEnd = performance.now();
                
                console.log(`   AUTO  : ${(autoEnd - autoStart).toFixed(2)}ms (chose optimal method)`);
            } catch (error) {
                console.log(`   AUTO  : ❌ Failed - ${error.message}`);
            }
        }
        
        // Demo 4: JSON string input
        console.log('\n📄 Demo 4: JSON String Input');
        const jsonString = JSON.stringify(generateTestData(1000));
        
        console.log(`JSON string size: ${(jsonString.length / 1024).toFixed(2)} KB`);
        
        const jsonStart = performance.now();
        const jsonResult = await duckdb.queryArrayObjectsViaFile(
            jsonString,
            'SELECT category, AVG(amount) as avg FROM data GROUP BY category'
        );
        const jsonEnd = performance.now();
        
        console.log(`✅ JSON string processing: ${(jsonEnd - jsonStart).toFixed(2)}ms`);
        console.log('🔍 Sample results:', jsonResult.rows.slice(0, 3));
        
        // Demo 5: Performance comparison with different approaches
        console.log('\n⚡ Demo 5: Performance Comparison (25,000 rows)');
        const perfData = generateTestData(25000);
        const sql = 'SELECT category, COUNT(*) as count, AVG(amount) as avg, MAX(amount) as max_amount FROM data GROUP BY category';
        
        const methods = [
            { name: 'JSON VALUES', fn: () => duckdb.queryArrayObjectsJSON(perfData, sql) },
            { name: 'NATIVE', fn: () => duckdb.queryArrayObjectsNative(perfData, sql) },
            { name: 'FILE-BASED', fn: () => duckdb.queryArrayObjectsViaFile(perfData, sql) },
            { name: 'ENHANCED AUTO', fn: () => duckdb.queryArrayObjectsEnhanced(perfData, sql) }
        ];
        
        for (const method of methods) {
            try {
                const start = performance.now();
                const result = await method.fn();
                const end = performance.now();
                
                console.log(`   ${method.name.padEnd(12)}: ${(end - start).toFixed(2)}ms (${result.rows.length} groups)`);
            } catch (error) {
                console.log(`   ${method.name.padEnd(12)}: ❌ Failed - ${error.message}`);
            }
        }
        
        // Demo 6: Complex analytics with file-based approach
        console.log('\n📈 Demo 6: Complex Analytics with File-Based Approach');
        const analyticsData = generateTestData(50000);
        
        const complexQuery = `
            WITH monthly_stats AS (
                SELECT 
                    category,
                    DATE_TRUNC('month', date::DATE) as month,
                    COUNT(*) as transaction_count,
                    SUM(amount) as total_amount,
                    AVG(amount) as avg_amount,
                    STDDEV(amount) as amount_stddev
                FROM data
                WHERE active = true
                GROUP BY category, month
            ),
            category_ranks AS (
                SELECT 
                    *,
                    ROW_NUMBER() OVER (PARTITION BY month ORDER BY total_amount DESC) as rank
                FROM monthly_stats
            )
            SELECT 
                month,
                category,
                total_amount,
                transaction_count,
                avg_amount,
                amount_stddev
            FROM category_ranks
            WHERE rank <= 2
            ORDER BY month DESC, rank
            LIMIT 10
        `;
        
        const analyticsStart = performance.now();
        const analyticsResult = await duckdb.queryArrayObjectsViaFile(analyticsData, complexQuery);
        const analyticsEnd = performance.now();
        
        console.log(`✅ Complex analytics: ${(analyticsEnd - analyticsStart).toFixed(2)}ms`);
        console.log('🔍 Top categories by month:', analyticsResult.rows.slice(0, 5));
        
        // Cleanup
        await duckdb.query('DROP TABLE IF EXISTS file_test_table');
        
        console.log('\n✨ File-based demo completed successfully!');
        console.log('\n💡 Key Benefits of File-Based Approach:');
        console.log('   • Leverages DuckDB\'s optimized read_json_auto function');
        console.log('   • Consistent performance regardless of data complexity');
        console.log('   • Automatic type inference and schema detection');
        console.log('   • Handles both JavaScript objects and JSON strings');
        console.log('   • Excellent for very large datasets (100k+ rows)');
        console.log('   • Automatic temporary file cleanup');
        
    } catch (error) {
        console.error('❌ Demo failed:', error);
    } finally {
        await duckdb.cleanup();
        console.log('🧹 Cleanup completed');
    }
}

// Export for testing
export { runFileBenchmark, generateTestData };

// Run demo if called directly
if (require.main === module) {
    runFileBenchmark().catch(console.error);
}