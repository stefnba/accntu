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
    /** The query function to wrap with error handling and validation */
    queryFn: QueryFn<TInput, TOutput>;
    /** Human-readable operation description for logging and error messages */
    operation?: string;
    /** Optional Zod schema to validate input data before execution */
    inputSchema?: z.ZodSchema<TInput, any, any>;
}

/**
 * Creates a wrapped query function with input validation and error handling.
 *
 * This is a function wrapper (returns a new function) that adds:
 * - Input validation using optional Zod schema
 * - Database-specific error handling via withDbQuery
 * - Consistent error formatting across all database operations
 *
 * Use this when you need to create a reusable query function with validation.
 * For direct execution without creating a wrapper, use withDbQuery instead.
 *
 * @template TInput - The input type for the query function
 * @template TOutput - The output type for the query function
 * @param params - Configuration object for the wrapper
 * @returns Wrapped query function with validation and error handling
 *
 * @example
 * ```typescript
 * // Create a reusable wrapped query function
 * const getUserById = queryFnHandler({
 *   queryFn: async ({ userId }) => db.select().from(users).where(eq(users.id, userId)),
 *   operation: 'get user by ID',
 *   inputSchema: z.object({ userId: z.string() })
 * });
 *
 * // Later: execute the wrapped function
 * const user = await getUserById({ userId: '123' });
 * ```
 */
export function dbQueryFnHandler<TInput, TOutput>(
    params: QueryFnHandlerParams<TInput, TOutput>
): QueryFn<TInput, TOutput> {
    const { queryFn, operation = 'database operation', inputSchema } = params;

    return async (inputData: TInput): Promise<TOutput | null> => {
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

        // Delegate to withDbQuery for consistent error handling
        return await withDbQuery({
            queryFn: async () => queryFn(data),
            operation,
        });
    };
}

/**
 * Executes a database query with comprehensive error handling.
 *
 * This is a direct execution wrapper (executes immediately) that provides:
 * - Database-specific error handling with proper error codes
 * - Development-mode error logging for debugging
 * - Consistent error formatting across all database operations
 *
 * Use this for direct query execution with error handling.
 * For creating reusable query functions with validation, use queryFnHandler instead.
 *
 * @template T - The return type of the query
 * @param queryFn - The query function to execute
 * @param operation - Human-readable operation description for logging
 * @returns The query result or null.
 *
 * @example
 * ```typescript
 * // Direct execution with error handling
 * const user = await withDbQuery({
 *   queryFn: async () => db.select().from(users).where(eq(users.id, userId)),
 *   operation: 'get user by ID',
 * });
 * ```
 */
export async function withDbQuery<T>({
    queryFn,
    operation = 'database operation',
}: {
    queryFn: () => Promise<T | null>;
    operation?: string;
}) {
    try {
        // Execute the query and return the result
        return await queryFn();
    } catch (error) {
        throw handleDbQueryError(error, operation);
    }
}
