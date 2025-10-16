import { AppErrors } from '@/server/lib/error';
import { DrizzleQueryError } from 'drizzle-orm';
import { PostgresError } from 'postgres';

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

    // Handle PostgreSQL errors with specific error codes
    if (error instanceof PostgresError) {
        const pgError = error as PostgresError;

        // Extract details for better error messages
        const detail = pgError.detail || '';
        const constraint = pgError.constraint_name || 'unknown';

        switch (pgError.code) {
            case '23505': // Unique constraint violation
                throw AppErrors.db('UNIQUE_VIOLATION', {
                    message: `Unique constraint violation${operationContext}: ${detail || pgError.message}`,
                    cause: error,
                    details: {
                        constraint,
                        postgresCode: pgError.code,
                        detail,
                    },
                });

            case '23503': // Foreign key constraint violation
                throw AppErrors.db('FOREIGN_KEY_VIOLATION', {
                    message: `Foreign key constraint violation${operationContext}: ${detail || pgError.message}`,
                    cause: error,
                    details: {
                        constraint,
                        postgresCode: pgError.code,
                        detail,
                    },
                });

            case '23502': // Not-null constraint violation
                throw AppErrors.db('QUERY_FAILED', {
                    message: `Not-null constraint violation${operationContext}: ${detail || pgError.message}`,
                    cause: error,
                    details: {
                        constraint,
                        postgresCode: pgError.code,
                        detail,
                        reason: 'not_null_violation',
                    },
                });

            default:
                // Other PostgreSQL errors
                throw AppErrors.db('QUERY_FAILED', {
                    message: `Database query failed${operationContext}: ${pgError.message}`,
                    cause: error,
                    details: {
                        postgresCode: pgError.code,
                        detail,
                    },
                });
        }
    }

    // Handle Drizzle query errors
    if (error instanceof DrizzleQueryError) {
        throw AppErrors.db('QUERY_FAILED', {
            message: `Database query failed${operationContext}: ${error.message}`,
            cause: error,
        });
    }

    // Handle connection errors
    if (error instanceof Error && 'code' in error && error.code === 'ECONNREFUSED') {
        throw AppErrors.db('CONNECTION_ERROR', {
            message: `Database connection refused${operationContext}`,
            cause: error,
        });
    }

    // Generic database error fallback
    throw AppErrors.db('QUERY_FAILED', {
        message: `Database operation failed${operationContext}`,
        cause: error instanceof Error ? error : new Error(String(error)),
    });
};
