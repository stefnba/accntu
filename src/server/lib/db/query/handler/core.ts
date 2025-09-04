import type { QueryFn } from '@/server/lib/db/query/factory/types';
import { errorFactory } from '@/server/lib/error';
import { BaseError } from '@/server/lib/error/base';
import { logDevError, shouldUseDevFormatting } from '@/server/lib/error/dev-formatter';
import { Table } from 'drizzle-orm';
import { z } from 'zod';

interface QueryFnHandlerParams<T extends Table, TInput, TOutput> {
    table: T;
    fn: QueryFn<TInput, TOutput>;
    operation?: string;
    inputSchema?: z.ZodSchema<TInput, any, any>;
}

/**
 * Wrapper function that adds logging and error handling to a query function
 */
export function queryFnHandler<T extends Table, TInput, TOutput>(
    params: QueryFnHandlerParams<T, TInput, TOutput>
): QueryFn<TInput, TOutput> {
    const { table, fn, operation = 'database operation', inputSchema } = params;

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
