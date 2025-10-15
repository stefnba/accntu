import type { QueryFn } from '@/server/lib/db/query/builder/types';
import { errorFactory } from '@/server/lib/errorOld';
import { BaseError } from '@/server/lib/errorOld/base';
import { logDevError, shouldUseDevFormatting } from '@/server/lib/errorOld/dev-formatter';
import { z } from 'zod';

/**
 * Configuration parameters for the query function handler wrapper.
 *
 * @template TInput - The input type for the query function
 * @template TOutput - The output type for the query function
 */
interface QueryFnHandlerParams<TInput, TOutput> {
    /** The query function to wrap with error handling and logging */
    fn: QueryFn<TInput, TOutput>;
    /** Human-readable operation description for logging and error messages */
    operation?: string;
    /** Optional Zod schema to validate input data before execution */
    inputSchema?: z.ZodSchema<TInput, any, any>;
}

/**
 * Wrapper function that adds comprehensive error handling, logging, and input validation to query functions.
 *
 * This wrapper provides:
 * - Input validation using optional Zod schema
 * - Database-specific error handling with proper error codes
 * - Development-mode error logging for debugging
 * - Consistent error formatting across all database operations
 *
 * @template TInput - The input type for the query function
 * @template TOutput - The output type for the query function
 * @param params - Configuration object for the wrapper
 * @returns Wrapped query function with enhanced error handling
 *
 * @example
 * ```typescript
 * const wrappedQuery = queryFnHandler({
 *   fn: async ({ userId }) => db.select().from(users).where(eq(users.id, userId)),
 *   operation: 'get user by ID',
 *   inputSchema: z.object({ userId: z.string() })
 * });
 * ```
 */
export function queryFnHandler<TInput, TOutput>(
    params: QueryFnHandlerParams<TInput, TOutput>
): QueryFn<TInput, TOutput> {
    const { fn, operation = 'database operation', inputSchema } = params;

    return async (inputData: TInput) => {
        let data = inputData;

        // Validate input data if schema is provided
        if (inputSchema) {
            const validatedInput = inputSchema.safeParse(data);
            if (!validatedInput.success) {
                throw errorFactory.createDatabaseError({
                    message: `Invalid input data for ${operation}`,
                    code: 'INVALID_INPUT',
                    cause: validatedInput.error,
                    // details: { zodErrors: validatedInput.error.errors },
                });
            }

            data = validatedInput.data;
        }

        try {
            // Execute the query
            const result = await fn(data);

            return result;
        } catch (error) {
            if (error instanceof BaseError) {
                throw error;
            }

            let dbError: BaseError;

            // Check if it's a database error (PostgreSQL error codes start with numbers)
            if (error instanceof Error && 'code' in error && /^\d/.test(String(error.code))) {
                dbError = errorFactory.createDatabaseError({
                    message: `Database error in '${operation}': ${error.message}`,
                    code: 'OPERATION_FAILED',
                    cause: error,
                });
            } else if (error instanceof Error && 'code' in error && error.code === 'ECONNREFUSED') {
                dbError = errorFactory.createDatabaseError({
                    message: `Database connection refused in '${operation}'`,
                    code: 'CONNECTION_ERROR',
                    cause: error,
                });
            } else {
                dbError = errorFactory.createDatabaseError({
                    message: `Unknown error in '${operation}'`,
                    code: 'OPERATION_FAILED',
                    cause: error instanceof Error ? error : undefined,
                });
            }

            // Log immediately in development for better debugging
            if (shouldUseDevFormatting()) {
                logDevError(dbError);
            }

            throw dbError;
        }
    };
}
