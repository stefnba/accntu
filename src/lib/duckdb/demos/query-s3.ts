import dotenv from 'dotenv';
import { z } from 'zod';
import { DuckDBTransactionTransformManager as DuckDBManager } from '../index';

// Load environment variables from .env file
dotenv.config();

/**
 * Example schemas for different data transformations
 */

// Transaction data schema
const TransactionSchema = z.object({
    id: z.string(),
    amount: z.number(),
    description: z.string(),
    category: z.string().optional(),
    date: z.string(),
    month: z.string(),
    is_expense: z.boolean(),
});

// Sales analytics schema
const SalesAnalyticsSchema = z.object({
    product: z.string(),
    monthly_revenue: z.number(),
    transaction_count: z.number(),
    avg_transaction: z.number(),
    growth_rate: z.number().optional(),
});

// User behavior schema
const UserBehaviorSchema = z.object({
    user_id: z.string(),
    total_spent: z.number(),
    transaction_count: z.number(),
    avg_amount: z.number(),
    first_transaction: z.string(),
    last_transaction: z.string(),
    days_active: z.number(),
});

/**
 * Example 1: Basic transaction transformation
 * Read CSV from S3, clean and categorize transactions
 */
async function example1BasicTransformation() {
    console.log('\n=== Example 1: Basic Transaction Transformation ===');

    const db = new DuckDBManager({
        s3: {
            region: process.env.AWS_BUCKET_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            endpoint: `s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com`,
        },
    });

    try {
        await db.initialize();

        const result = await db.transformData({
            source: {
                type: 'csv',
                path: 's3://accntu-test-bucket/transactions.csv',
                options: {
                    delim: ';',
                    normalize_names: true,
                    dateformat: '%d-%m-%Y',
                },
            },
            transformSql: `
        SELECT
          id::VARCHAR as id,
          amount::DECIMAL as amount,
          UPPER(TRIM(description)) as description,
          CASE
            WHEN LOWER(description) LIKE '%grocery%' OR LOWER(description) LIKE '%food%' THEN 'Food'
            WHEN LOWER(description) LIKE '%gas%' OR LOWER(description) LIKE '%fuel%' THEN 'Transportation'
            WHEN LOWER(description) LIKE '%salary%' OR LOWER(description) LIKE '%income%' THEN 'Income'
            ELSE 'Other'
          END as category,
          authorised_on::VARCHAR as date,
          DATE_TRUNC('month', authorised_on::DATE)::VARCHAR as month,
          amount::DECIMAL < 0 as is_expense
        FROM data
        WHERE amount::DECIMAL != 0
        ORDER BY authorised_on::DATE DESC
      `,
            schema: TransactionSchema,
        });

        console.log(`✅ Processed ${result.totalRows} rows`);
        console.log(`✅ Successfully validated ${result.validRows} transactions`);
        console.log(`❌ Validation errors: ${result.validationErrors.length}`);
        console.log(`⏱️  Total time: ${result.metrics.totalTimeMs}ms`);

        if (result.data.length > 0) {
            console.log('\nSample transactions:');
            console.table(result.data.slice(0, 5));
        }

        if (result.validationErrors.length > 0) {
            console.log('\nValidation errors:');
            result.validationErrors.slice(0, 3).forEach((error, i) => {
                console.log(`Error ${i + 1}:`, error.errors[0].message);
            });
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.cleanup();
    }
}

/**
 * Example 2: Advanced analytics transformation
 * Complex aggregation with window functions and growth calculations
 */
async function example2AdvancedAnalytics() {
    console.log('\n=== Example 2: Advanced Sales Analytics ===');

    const db = new DuckDBManager({
        s3: {
            region: process.env.AWS_BUCKET_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            endpoint: `s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com`,
        },
    });

    try {
        await db.initialize();

        const result = await db.transformToValidatedJson(
            {
                source: {
                    type: 'csv',
                    path: 's3://accntu-test-bucket/transactions.csv',
                    options: {
                        delim: ';',
                        normalize_names: true,
                        dateformat: '%d-%m-%Y',
                    },
                },
                transformSql: `
        WITH monthly_sales AS (
          SELECT
            CASE
              WHEN LOWER(description) LIKE '%grocery%' THEN 'Groceries'
              WHEN LOWER(description) LIKE '%restaurant%' THEN 'Dining'
              WHEN LOWER(description) LIKE '%gas%' THEN 'Fuel'
              ELSE 'Other'
            END as product,
            DATE_TRUNC('month', authorised_on::DATE) as month,
            ABS(amount::DECIMAL) as amount
          FROM data
          WHERE amount::DECIMAL < 0  -- Only expenses
            AND amount::DECIMAL < -10  -- Significant amounts only
        ),
        aggregated AS (
          SELECT
            product,
            SUM(amount) as monthly_revenue,
            COUNT(*) as transaction_count,
            AVG(amount) as avg_transaction
          FROM monthly_sales
          GROUP BY product
          HAVING SUM(amount) > 50  -- Products with at least $50 total
        )
        SELECT
          product,
          ROUND(monthly_revenue, 2) as monthly_revenue,
          transaction_count,
          ROUND(avg_transaction, 2) as avg_transaction,
          ROUND(
            (monthly_revenue - AVG(monthly_revenue) OVER()) / AVG(monthly_revenue) OVER() * 100,
            2
          ) as growth_rate
        FROM aggregated
        ORDER BY monthly_revenue DESC
      `,
                schema: SalesAnalyticsSchema,
            },
            {
                continueOnValidationError: true,
                maxValidationErrors: 10,
            }
        );

        console.log(`✅ Generated ${result.length} analytics records`);
        console.table(result);
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.cleanup();
    }
}

/**
 * Example 3: User behavior analysis
 * Multi-step transformation with date calculations
 */
async function example3UserBehaviorAnalysis() {
    console.log('\n=== Example 3: User Behavior Analysis ===');

    const db = new DuckDBManager({
        s3: {
            region: process.env.AWS_BUCKET_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            endpoint: `s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com`,
        },
    });

    try {
        await db.initialize();

        const result = await db.transformData(
            {
                source: {
                    type: 'csv',
                    path: 's3://accntu-test-bucket/transactions.csv',
                    options: {
                        delim: ';',
                        normalize_names: true,
                        dateformat: '%d-%m-%Y',
                    },
                },
                transformSql: `
        WITH user_transactions AS (
          SELECT
            'user_' || ROW_NUMBER() OVER (ORDER BY authorised_on) % 10 + 1 as user_id,
            ABS(amount::DECIMAL) as amount,
            authorised_on::DATE as transaction_date
          FROM data
          WHERE amount::DECIMAL < 0  -- Only expenses
        ),
        user_stats AS (
          SELECT
            user_id,
            SUM(amount) as total_spent,
            COUNT(*) as transaction_count,
            AVG(amount) as avg_amount,
            MIN(transaction_date) as first_transaction,
            MAX(transaction_date) as last_transaction
          FROM user_transactions
          GROUP BY user_id
          HAVING COUNT(*) >= 3  -- Users with at least 3 transactions
        )
        SELECT
          user_id,
          ROUND(total_spent, 2) as total_spent,
          transaction_count,
          ROUND(avg_amount, 2) as avg_amount,
          first_transaction::VARCHAR as first_transaction,
          last_transaction::VARCHAR as last_transaction,
          (last_transaction - first_transaction) as days_active
        FROM user_stats
        ORDER BY total_spent DESC
      `,
                schema: UserBehaviorSchema,
            },
            {
                continueOnValidationError: false, // Strict validation
                includeInvalidRows: true,
            }
        );

        console.log(`✅ Analyzed ${result.validRows} users`);
        console.log(
            `📊 Performance: Read(${result.metrics.readTimeMs}ms) + Transform(${result.metrics.transformTimeMs}ms) + Validate(${result.metrics.validationTimeMs}ms)`
        );

        if (result.data.length > 0) {
            console.table(result.data);
        }

        if (result.validationErrors.length > 0) {
            console.log(`\n❌ Found ${result.validationErrors.length} validation errors`);
            result.validationErrors.forEach((error, i) => {
                console.log(`Error ${i + 1} (row ${error.rowIndex}):`, error.errors[0]?.message);
            });
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.cleanup();
    }
}

/**
 * Example 4: Multiple data sources with UNION
 * Demonstrate reading from multiple files
 */
async function example4MultipleDataSources() {
    console.log('\n=== Example 4: Multiple Data Sources ===');

    const db = new DuckDBManager({
        s3: {
            region: process.env.AWS_BUCKET_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            endpoint: `s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com`,
        },
    });

    try {
        await db.initialize();

        // Read from multiple CSV files (globbing pattern)
        const result = await db.transformToValidatedJson({
            source: {
                type: 'csv',
                path: 's3://accntu-test-bucket/transactions*.csv', // Glob pattern
                options: {
                    delim: ';',
                    normalize_names: true,
                    dateformat: '%d-%m-%Y',
                    filename: true, // Include filename in results
                },
            },
            transformSql: `
        SELECT
          id::VARCHAR as id,
          ABS(amount::DECIMAL) as amount,
          TRIM(description) as description,
          'General' as category,
          authorised_on::VARCHAR as date,
          DATE_TRUNC('month', authorised_on::DATE)::VARCHAR as month,
          amount::DECIMAL < 0 as is_expense
        FROM data
        WHERE amount::DECIMAL != 0
        LIMIT 10  -- Limit for demo
      `,
            schema: TransactionSchema,
        });

        console.log(`✅ Processed records from multiple files: ${result.length}`);
        if (result.length > 0) {
            console.table(result);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.cleanup();
    }
}

/**
 * Run all examples
 */
async function runAllExamples() {
    console.log('🚀 DuckDB Transformation Examples\n');

    try {
        await example1BasicTransformation();
        await example2AdvancedAnalytics();
        await example3UserBehaviorAnalysis();
        await example4MultipleDataSources();
    } catch (error) {
        console.error('❌ Failed to run examples:', error);
    }

    console.log('\n✅ All examples completed!');
}

// Run examples if this file is executed directly
if (require.main === module) {
    runAllExamples().catch(console.error);
}

export {
    example1BasicTransformation,
    example2AdvancedAnalytics,
    example3UserBehaviorAnalysis,
    example4MultipleDataSources,
    runAllExamples,
};
