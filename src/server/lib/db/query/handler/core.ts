import type { QueryFn } from '@/server/lib/db/query/builder/types';
import { handleDbQueryError } from '@/server/lib/db/query/handler/error';
import { AppErrors } from '@/server/lib/error';
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

    return async (inputData: TInput): Promise<TOutput> => {
        let data = inputData;

        // Validate input data if schema is provided
        if (inputSchema) {
            const validatedInput = inputSchema.safeParse(data);
            if (!validatedInput.success) {
                throw AppErrors.validation('INVALID_FORMAT', {
                    message: `Invalid input data for ${operation}`,
                    cause: validatedInput.error,
                });
            }
            data = validatedInput.data;
        }

        try {
            // Execute the query
            const result = await fn(data);

            return result;
        } catch (error) {
            return handleDbQueryError(error, operation);
        }
    };
}

/**
 * Wrapper function that adds comprehensive error handling to query functions.
 *
 * This wrapper provides:
 * - Database-specific error handling with proper error codes
 * - Development-mode error logging for debugging
 * - Consistent error formatting across all database operations
 *
 * @example
 * ```typescript
 * const wrappedQuery = queryHandler({
 *   query: async () => db.select().from(users).where(eq(users.id, userId)),
 *   operation: 'get user by ID',
 * });
 * ```
 */
export async function queryHandler<T>({
    query,
    operation = 'database operation',
}: {
    query: () => Promise<T | null>;
    operation?: string;
}) {
    try {
        // execute the query and return the result
        return await query();
    } catch (error) {
        return handleDbQueryError(error, operation);
    }
}
