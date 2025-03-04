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

/**
 * Executes a database query with error handling
 *
 * This higher-order function wraps database queries with standardized
 * error handling. It catches any errors that occur during the query
 * execution and transforms them into structured errors.
 *
 * @param queryFn - The database query function to execute
 * @param operation - Description of the operation (for error messages)
 * @returns The result of the query function
 * @example
 * ```
 * const result = await withDb(
 *   () => db.insert(users).values({ name: 'John' }).returning(),
 *   'insert user'
 * );
 * ```
 */
export async function withDb<T>(
    queryFn: () => Promise<T>,
    operation = 'database operation'
): Promise<T> {
    try {
        return await queryFn();
    } catch (error) {
        handleDatabaseError(error as Error, operation);
    }
}

/**
 * Executes a database query that may return null with error handling
 *
 * Similar to withDb, but specifically for queries that might legitimately
 * return null (like finding a record by ID). This prevents null results
 * from being treated as errors.
 *
 * @param queryFn - The database query function to execute
 * @param operation - Description of the operation (for error messages)
 * @returns The result of the query function or null
 * @example
 * ```
 * const user = await withDbNullable(
 *   () => db.select().from(users).where(eq(users.id, userId)).limit(1),
 *   'find user by ID'
 * );
 * ```
 */
export async function withDbNullable<T>(
    queryFn: () => Promise<T>,
    operation = 'database operation (may return null)'
): Promise<T | null> {
    try {
        return await queryFn();
    } catch (error) {
        handleDatabaseError(error as Error, operation);
    }
}

/**
 * Executes a database operation within a transaction
 *
 * This function wraps a database operation in a transaction, ensuring that
 * all operations either complete successfully or are rolled back. It also
 * provides standardized error handling for transaction failures.
 *
 * @param operation - Function that performs database operations within the transaction
 * @returns The result of the operation function
 * @example
 * ```
 * const result = await withTransaction(async (trx) => {
 *   const user = await trx.insert(users).values({ name: 'John' }).returning();
 *   await trx.insert(profiles).values({ userId: user.id });
 *   return user;
 * });
 * ```
 */
export async function withTransaction<T, TrxType = any>(
    operation: (trx: TrxType) => Promise<T>
): Promise<T> {
    // This is a placeholder implementation
    // In a real application, you would use your database client's transaction API
    // For example, with Drizzle:
    // return await db.transaction(async (trx) => {
    //   return await operation(trx);
    // });

    try {
        // Placeholder implementation
        return await operation({} as TrxType);
    } catch (error) {
        if (error instanceof Error) {
            throw errorFactory.createDatabaseError({
                message: 'Transaction failed',
                code: 'DB.TRANSACTION_FAILED',
                cause: error,
            });
        }
        throw error;
    }
}
