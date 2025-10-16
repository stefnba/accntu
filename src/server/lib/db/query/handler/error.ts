import { AppErrors } from '@/server/lib/error';
import { DrizzleQueryError } from 'drizzle-orm';
import postgres from 'postgres';

/**
 * Handle database query errors with PostgreSQL-specific error code detection
 *
 * Detects common PostgreSQL error codes and maps them to appropriate error types:
 * - 23505: Unique constraint violation
 * - 23503: Foreign key constraint violation
 * - 23502: Not-null constraint violation
 * - ECONNREFUSED: Database connection refused
 *
 * @param error - The error thrown from database query
 * @param operation - Optional operation description for better error messages
 * @throws AppError with appropriate error code and details
 *
 * @example
 * ```typescript
 * try {
 *   await db.insert(users).values({ email: 'test@example.com' });
 * } catch (error) {
 *   handleDbQueryError(error, 'create user');
 * }
 * ```
 */
export const handleDbQueryError = (error: unknown, operation?: string): never => {
    const operationContext = operation ? ` during '${operation}'` : '';

    // check for drizzle query error
    if (error instanceof DrizzleQueryError) {
        const drizzleError = error;

        const errorObj = { query: drizzleError.query };

        // check for postgres error
        if (drizzleError.cause instanceof postgres.PostgresError) {
            const postgresError = drizzleError.cause;
            const {
                code,
                column_name,
                table_name: table,
                // name,
                constraint_name: constraint,
                message,
            } = postgresError;

            Object.assign(errorObj, {
                table,
                code,
                message,
                constraint,
            });

            switch (postgresError.code) {
                case '23505':
                    throw AppErrors.db('UNIQUE_VIOLATION', {
                        message: `Unique constraint violation${operationContext}: ${message}`,
                        cause: error,
                        layer: 'db',
                        details: {
                            constraint,
                            postgresCode: code,
                            detail: message,
                        },
                    });
                case '23503':
                    throw AppErrors.db('FOREIGN_KEY_VIOLATION', {
                        message: `Foreign key constraint violation${operationContext}: ${message}`,
                        cause: error,
                        layer: 'db',
                        details: {
                            constraint,
                            postgresCode: code,
                            detail: message,
                        },
                    });
                case '23502':
                    throw AppErrors.db('QUERY_FAILED', {
                        message: `Not-null constraint violation${operationContext}: ${message}`,
                        cause: error,
                        layer: 'db',
                        details: {
                            constraint,
                            postgresCode: code,
                            detail: message,
                        },
                    });
                default:
                    throw AppErrors.db('QUERY_FAILED', {
                        message: `Database query failed${operationContext}: ${message}`,
                        cause: error,
                        layer: 'db',
                        details: {
                            postgresCode: code,
                            detail: message,
                        },
                    });
            }
        }

        throw AppErrors.db('QUERY_FAILED', {
            message: `Database query failed${operationContext}: ${error.message}`,
            cause: error,
            layer: 'db',
        });
    }

    // Handle connection errors
    if (error instanceof Error && 'code' in error && error.code === 'ECONNREFUSED') {
        throw AppErrors.db('CONNECTION_ERROR', {
            message: `Database connection refused${operationContext}`,
            cause: error,
            layer: 'db',
        });
    }

    // else throw generic database error
    throw error;
};
