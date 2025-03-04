/**
 * Database Error Handling
 *
 * This module provides utilities for handling database errors and transforming
 * them into structured errors with appropriate error codes and messages.
 */

import { errorFactory } from './factory';

/**
 * Handles database errors and transforms them into structured errors
 *
 * This function catches database errors and transforms them into our
 * standardized BaseError format with appropriate error codes and messages.
 * It identifies common database error types like unique constraint violations
 * and foreign key violations.
 *
 * @param error - The database error to handle
 * @param operation - Description of the operation that failed (for logging)
 * @returns A BaseError with appropriate error code and details
 */
export function handleDatabaseError(error: Error, operation: string): never {
    console.error(`Database error during ${operation}:`, error);

    // Check for specific PostgreSQL error types
    if (error && typeof error === 'object' && 'code' in error) {
        const pgError = error as {
            code: string;
            detail?: string;
            table?: string;
            constraint?: string;
        };

        // Unique constraint violation
        if (pgError.code === '23505') {
            throw errorFactory.createDatabaseError({
                message: 'A record with this data already exists',
                code: 'DB.UNIQUE_VIOLATION',
                cause: new Error(String(error)),
                statusCode: 409,
            });
        }

        // Foreign key constraint violation
        if (pgError.code === '23503') {
            throw errorFactory.createDatabaseError({
                message: 'Referenced record does not exist',
                code: 'DB.FOREIGN_KEY_VIOLATION',
                cause: new Error(String(error)),
                statusCode: 400,
            });
        }

        // Not null constraint violation
        if (pgError.code === '23502') {
            throw errorFactory.createDatabaseError({
                message: 'Required field is missing',
                code: 'DB.QUERY_FAILED',
                cause: new Error(String(error)),
                statusCode: 400,
            });
        }

        // Connection error
        if (pgError.code === 'ECONNREFUSED') {
            throw errorFactory.createDatabaseError({
                message: 'Database connection failed',
                code: 'DB.CONNECTION_ERROR',
                cause: new Error(String(error)),
                statusCode: 503,
            });
        }
    }

    // Generic database error
    throw errorFactory.createDatabaseError({
        message: 'Database operation failed',
        code: 'DB.QUERY_FAILED',
        cause: error instanceof Error ? error : new Error(String(error)),
    });
}
