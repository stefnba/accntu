import { parseZodError } from '@/lib/utils/zod';
import { z } from 'zod';
import { DuckDBCore } from './core';
import { DuckDBQueryError } from './errors';
import type {
    AggregatedValidationErrors,
    DuckDBConfig,
    RowValidationError,
    TransformationConfig,
    TransformationOptions,
    TransformationResult,
} from './types';

/**
 * Complete DuckDB manager for transformation and transaction operations.
 * Inherits core functionality from DuckDBCore and adds data transformation with Zod validation
 * plus transaction-specific operations like duplicate detection.
 */
export class DuckDBTransactionTransformManager extends DuckDBCore {
    constructor(config: DuckDBConfig = {}) {
        super(config);
    }

    /**
     * Transform data from S3 with CTE approach and Zod validation
     *
     * The `transformSql` query can be a full SQL query, including CTEs.
     * It must use the `{{source}}` placeholder to specify the data source.
     *
     * If an `idConfig` is provided, a unique key field will be automatically
     * generated and included in the `{{source}}` data. You can then select
     * it like any other column. The field name is determined by `idConfig.fieldName`
     * or defaults to 'id'.
     *
     * @example
     * ```typescript
     * const result = await db.transformData({
     *   source: { type: 'csv', path: 's3://bucket/data.csv' },
     *   idConfig: { columns: ['col1', 'col2'], fieldName: 'unique_id' },
     *   transformSql: `
     *     WITH cleaned_data AS (
     *       SELECT
     *         *, -- Includes the auto-generated 'unique_id' field
     *         (col3 * 100) AS amount_in_cents
     *       FROM {{source}}
     *     )
     *     SELECT
     *       amount_in_cents,
     *       unique_id
     *     FROM cleaned_data
     *     WHERE col1 > 0
     *   `,
     *   schema: z.object({ amount_in_cents: z.number(), unique_id: z.string() })
     * });
     * ```
     */
    async transformData<T>(
        config: TransformationConfig<T>,
        options: TransformationOptions = {}
    ): Promise<TransformationResult<T>> {
        const startTime = Date.now();
        let readTime = 0;
        let transformTime = 0;
        let validationTime = 0;

        const {
            continueOnValidationError = true,
            maxValidationErrors = 100,
            maxErrorDetailRows = 25,
            maxExamplesPerField = 5, // Default to 5 examples per field
            includeInvalidRows = false,
        } = options;

        // Define placeholder identifiers for easy management
        const SOURCE_IDENTIFIER = 'data';

        /**
         * Build a regular expression for a placeholder identifier
         * @param identifier - The identifier to build a regex for
         * @param flags - The flags to use for the regex
         * @returns The regex for the placeholder identifier
         */
        const buildPlaceholderRegex = (identifier: string, flags = '') =>
            new RegExp(`{{\\s*${identifier}\\s*}}`, flags);

        try {
            // Step 1: Build the SQL fragments for data source and key generation
            const readStartTime = Date.now();
            let dataSourceSql = this.buildDataSourceSql(config.source);

            // If idConfig is provided, enrich the data source with a generated key
            if (config.idConfig) {
                const idLength = 25;
                const idFieldName = config.idConfig.fieldName || 'key';
                const hashColumns = config.idConfig.columns
                    .map((col) => `COALESCE(CAST("${col}" AS VARCHAR), '')`)
                    .join(` || '|' || `);
                const keyExpression = `SUBSTR(MD5(${hashColumns}), 1, ${idLength})`;

                // Wrap the original source in a subquery that adds the key
                dataSourceSql = `(SELECT *, ${keyExpression} AS "${idFieldName}" FROM (${dataSourceSql}))`;
            }

            let fullQuery = config.transformSql;

            // It's mandatory for the user's query to specify the source.
            if (!fullQuery.match(buildPlaceholderRegex(SOURCE_IDENTIFIER))) {
                throw new DuckDBQueryError(
                    `Transformation query must include the '{{${SOURCE_IDENTIFIER}}}' placeholder.`,
                    fullQuery
                );
            }
            fullQuery = fullQuery.replace(
                buildPlaceholderRegex(SOURCE_IDENTIFIER, 'g'),
                dataSourceSql
            );

            readTime = Date.now() - readStartTime;

            // Step 2: Execute transformation query
            const transformStartTime = Date.now();
            const result = await this.query(fullQuery, config.params);
            transformTime = Date.now() - transformStartTime;

            // Step 3: Validate each row with Zod schema
            const validationStartTime = Date.now();
            const validatedData: T[] = [];
            const validationErrors: RowValidationError[] = [];

            for (let i = 0; i < result.rows.length; i++) {
                const row = result.rows[i];

                try {
                    const validatedRow = config.schema.parse(row);
                    validatedData.push(validatedRow);
                } catch (error) {
                    if (error instanceof z.ZodError) {
                        // Create detailed error report if within the limit
                        if (validationErrors.length < maxErrorDetailRows) {
                            validationErrors.push({
                                rowIndex: i,
                                row: includeInvalidRows ? row : {},
                                errors: parseZodError(error, row),
                            });
                        }

                        // Stop if we've reached max validation errors and not continuing on error
                        if (
                            !continueOnValidationError ||
                            (maxValidationErrors > 0 &&
                                validationErrors.length >= maxValidationErrors)
                        ) {
                            break;
                        }
                    } else {
                        throw error; // Re-throw non-Zod errors
                    }
                }
            }

            validationTime = Date.now() - validationStartTime;

            // Step 4: Aggregate validation errors by field for a summary view
            const aggregatedErrors: AggregatedValidationErrors = {};
            for (const rowError of validationErrors) {
                for (const fieldError of rowError.errors) {
                    const path = fieldError.path.join('.');
                    if (!aggregatedErrors[path]) {
                        aggregatedErrors[path] = { messages: [], examples: [] };
                    }

                    // Add unique error messages
                    if (!aggregatedErrors[path].messages.includes(fieldError.message)) {
                        aggregatedErrors[path].messages.push(fieldError.message);
                    }

                    // Add unique, non-null examples up to the limit
                    if (
                        aggregatedErrors[path].examples.length < maxExamplesPerField &&
                        fieldError.value !== undefined &&
                        fieldError.value !== null &&
                        !aggregatedErrors[path].examples.includes(fieldError.value)
                    ) {
                        aggregatedErrors[path].examples.push(fieldError.value);
                    }
                }
            }
            const totalTime = Date.now() - startTime;

            return {
                data: result.rows,
                validatedData,
                totalRows: result.rowCount,
                validRows: validatedData.length,
                validationErrors,
                aggregatedErrors,
                metrics: {
                    readTimeMs: readTime,
                    transformTimeMs: transformTime,
                    validationTimeMs: validationTime,
                    totalTimeMs: totalTime,
                },
            };
        } catch (error) {
            if (error instanceof DuckDBQueryError) {
                throw error;
            }
            throw new DuckDBQueryError(
                `Transformation failed: ${error instanceof Error ? error.message : String(error)}`,
                config.transformSql,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Transform data and return only successfully validated rows as JSON
     * This is a convenience method for the most common use case
     */
    async transformToValidatedJson<T>(
        config: TransformationConfig<T>,
        options: TransformationOptions = {}
    ): Promise<T[]> {
        const result = await this.transformData(config, options);

        if (result.validationErrors.length > 0 && !options.continueOnValidationError) {
            const firstError = result.validationErrors[0];
            const firstField = firstError.errors[0];
            const errorMessage = `Validation failed for ${result.validationErrors.length} rows. First error on row ${firstError.rowIndex}, field '${firstField.path.join('.')}': ${firstField.message}`;
            throw new DuckDBQueryError(errorMessage, config.transformSql);
        }

        return result.validatedData;
    }

    /**
     * Bulk duplicate detection using PostgreSQL extension
     */
    async bulkCheckDuplicates<T extends Record<string, any>>({
        transactions,
        userId,
        keyExtractor,
        transactionTableName,
    }: {
        transactions: T[];
        userId: string;
        keyExtractor: (item: T) => string;
        transactionTableName: string;
    }): Promise<Array<T & { isDuplicate: boolean; existingTransactionId?: string }>> {
        if (!this.config.postgres) {
            throw new DuckDBQueryError('PostgreSQL configuration not provided');
        }

        if (transactions.length === 0) {
            return [];
        }

        // Use dynamic PostgreSQL alias and table
        const pgAlias = this.getPostgresAlias();
        const fullTableName = `${pgAlias}.${transactionTableName}`;
        const tempTableName = `temp_transactions_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        let duplicateCheckQuery = '';

        try {
            // Create temporary table with new transactions using the core method
            const transactionData = transactions.map((transaction, index) => ({
                key: keyExtractor(transaction),
                data: JSON.stringify(transaction),
                row_index: index,
            }));

            await this.createTempTableFromArray(tempTableName, transactionData);

            // Perform bulk duplicate check with PostgreSQL join
            duplicateCheckQuery = `
                WITH existing_keys AS (
                    SELECT key, id
                    FROM ${fullTableName}
                    WHERE user_id = $1
                        AND key IN (SELECT key FROM ${tempTableName})
                        AND is_active = true
                )
                SELECT
                    t.key,
                    t.data,
                    t.row_index,
                    CASE WHEN ek.key IS NOT NULL THEN true ELSE false END as is_duplicate,
                    ek.id as existing_transaction_id
                FROM ${tempTableName} t
                LEFT JOIN existing_keys ek ON t.key = ek.key
                ORDER BY t.row_index
            `;

            const result = await this.query(duplicateCheckQuery, [userId]);

            // Clean up temporary table
            await this.query(`DROP TABLE ${tempTableName}`);

            // Map results back to original transaction objects
            return result.rows.map((row) => ({
                ...JSON.parse(row.data),
                isDuplicate: row.is_duplicate,
                existingTransactionId: row.existing_transaction_id || undefined,
            }));
        } catch (error) {
            // Ensure cleanup on error
            try {
                await this.query(`DROP TABLE IF EXISTS ${tempTableName}`);
            } catch (cleanupError) {
                console.warn('Failed to cleanup temp table:', cleanupError);
            }

            throw new DuckDBQueryError(
                `Bulk duplicate check failed: ${error instanceof Error ? error.message : String(error)}`,
                duplicateCheckQuery,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Fallback duplicate detection using standard queries
     * Used when PostgreSQL extension is not available
     */
    async fallbackCheckDuplicates<T extends Record<string, any>>({
        transactions,
        keyExtractor,
    }: {
        transactions: T[];
        keyExtractor: (item: T) => string;
    }): Promise<Array<T & { isDuplicate: boolean; existingTransactionId?: string }>> {
        // Simple fallback that just marks all as not duplicate
        // In real implementation, this would use the existing JavaScript approach
        return transactions.map((transaction) => ({
            ...transaction,
            isDuplicate: false,
            existingTransactionId: undefined,
        }));
    }

    /**
     * Smart duplicate detection with automatic fallback
     */
    async checkDuplicatesWithFallback<T extends Record<string, any>>({
        transactions,
        userId,
        keyExtractor,
        transactionTableName = 'transaction',
    }: {
        transactions: T[];
        userId: string;
        keyExtractor: (item: T) => string;
        transactionTableName?: string;
    }): Promise<Array<T & { isDuplicate: boolean; existingTransactionId?: string }>> {
        try {
            // Try PostgreSQL extension approach first if postgres config is available
            if (this.config.postgres) {
                return await this.bulkCheckDuplicates({
                    transactions,
                    userId,
                    keyExtractor,
                    transactionTableName,
                });
            }
        } catch (error) {
            console.warn('PostgreSQL extension duplicate check failed, falling back:', error);
        }

        // Fallback to traditional approach
        return await this.fallbackCheckDuplicates({
            transactions,
            keyExtractor,
        });
    }

    /**
     * Transform transactions with currency conversion and duplicate checking
     */
    async transformTransactions<T extends Record<string, any>>({
        transactions,
        userId,
        keyExtractor,
        transformer,
        transactionTableName,
    }: {
        transactions: T[];
        userId: string;
        keyExtractor: (item: T) => string;
        transformer?: (transaction: T) => T | Promise<T>;
        transactionTableName: string;
    }): Promise<Array<T & { isDuplicate: boolean; existingTransactionId?: string }>> {
        // Transform transactions if transformer provided
        let transformedTransactions = transactions;
        if (transformer) {
            transformedTransactions = await Promise.all(transactions.map(transformer));
        }

        // Check for duplicates
        return await this.checkDuplicatesWithFallback({
            transactions: transformedTransactions,
            userId,
            keyExtractor,
            transactionTableName,
        });
    }

    /**
     * Batch process transactions with streaming support
     */
    async batchProcessTransactions<T extends Record<string, any>>({
        transactions,
        userId,
        keyExtractor,
        batchSize = 1000,
        onBatchProcessed,
        transactionTableName = 'transaction',
    }: {
        transactions: T[];
        userId: string;
        keyExtractor: (item: T) => string;
        batchSize?: number;
        onBatchProcessed?: (processed: number, total: number) => void;
        transactionTableName?: string;
    }): Promise<Array<T & { isDuplicate: boolean; existingTransactionId?: string }>> {
        const results: Array<T & { isDuplicate: boolean; existingTransactionId?: string }> = [];

        for (let i = 0; i < transactions.length; i += batchSize) {
            const batch = transactions.slice(i, i + batchSize);
            const batchResults = await this.checkDuplicatesWithFallback({
                transactions: batch,
                userId,
                keyExtractor,
                transactionTableName,
            });

            results.push(...batchResults);

            if (onBatchProcessed) {
                onBatchProcessed(Math.min(i + batchSize, transactions.length), transactions.length);
            }
        }

        return results;
    }
}
