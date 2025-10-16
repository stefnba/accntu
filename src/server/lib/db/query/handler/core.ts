import type { QueryFn } from '@/server/lib/db/query/builder/types';
import { AppError, AppErrors } from '@/server/lib/error';
import { z } from 'zod';
import { handleDbQueryError } from './error';

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

    return async (inputData: TInput): Promise<TOutput | undefined> => {
        let data = inputData;

        // Validate input data if schema is provided
        if (inputSchema) {
            const validatedInput = inputSchema.safeParse(data);
            if (!validatedInput.success) {
                throw AppErrors.validation('INVALID_FORMAT', {
                    message: `Invalid input data for ${operation}`,
                    cause: validatedInput.error,
                    details: {
                        operation,
                        zodErrors: validatedInput.error,
                    },
                });
            }

            data = validatedInput.data;
        }

        try {
            // Execute the query
            const result = await fn(data);

            return result;
        } catch (error) {
            // Re-throw if already an AppError
            if (AppError.isAppError(error)) {
                throw error;
            }

            // Handle database-specific errors with PostgreSQL detection
            handleDbQueryError(error, operation);
        }
    };
}
