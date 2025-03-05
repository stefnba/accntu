/**
 * Database Handler Utilities
 *
 * This module provides utilities for handling database operations with
 * consistent error handling, validation, and response formatting.
 */

import { z } from 'zod';
import { BaseError } from '../error/base';
import { handleDatabaseError } from '../error/db';
import { errorFactory } from '../error/factory';

/**
 * Core implementation for database operations with validation
 * @internal
 */
async function executeDbQueryValidated<
    TOutput = unknown,
    TInput = unknown,
    TInputSchema extends z.ZodSchema<TInput, any, any> = z.ZodSchema<TInput, any, any>,
    TOutputSchema extends z.ZodSchema<TOutput, any, any> = z.ZodSchema<TOutput, any, any>,
>({
    queryFn,
    inputSchema,
    outputSchema,
    inputData,
    operation,
    executor,
}: {
    queryFn: (validatedInput?: TInput) => Promise<TOutput>;
    inputSchema?: TInputSchema;
    outputSchema?: TOutputSchema;
    inputData?: TInput;
    operation: string;
    executor: ({
        queryFn,
        operation,
    }: {
        queryFn: () => Promise<TOutput>;
        operation: string;
    }) => Promise<TOutput | null>;
}): Promise<TOutput | null> {
    try {
        // Validate input data if schema is provided
        let validatedInput: TInput | undefined = undefined;

        if (inputSchema) {
            if (inputData === undefined) {
                throw new Error('Input data must be provided when inputSchema is specified');
            }

            try {
                validatedInput = inputSchema.parse(inputData);
            } catch (validationError) {
                if (validationError instanceof z.ZodError) {
                    throw errorFactory.createValidationError({
                        message: `Invalid input data for ${operation}`,
                        code: 'DB.INVALID_INPUT',
                        cause: validationError,
                        details: { zodErrors: validationError.errors },
                    });
                }
                throw validationError;
            }
        }

        // Execute the query
        const result = await executor({
            queryFn: async () => await queryFn(validatedInput),
            operation,
        });

        // Validate output data if schema is provided
        if (result !== null && outputSchema) {
            try {
                return outputSchema.parse(result);
            } catch (validationError) {
                if (validationError instanceof z.ZodError) {
                    throw errorFactory.createValidationError({
                        message: `Invalid output data from ${operation}`,
                        code: 'DB.INVALID_OUTPUT',
                        cause: validationError,
                        details: { zodErrors: validationError.errors },
                    });
                }
                throw validationError;
            }
        }

        return result;
    } catch (error) {
        if (error instanceof BaseError) {
            throw error;
        }

        throw errorFactory.createDatabaseError({
            message: `Unknown error in ${operation}`,
            code: 'DB.OPERATION_FAILED',
            cause: error instanceof Error ? error : undefined,
        });
    }
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
 * const result = await withDbQuery(
 *   () => db.insert(users).values({ name: 'John' }).returning(),
 *   'insert user'
 * );
 * ```
 */
export async function withDbQuery<T>({
    queryFn,
    operation = 'database operation',
}: {
    queryFn: () => Promise<T>;
    operation?: string;
}): Promise<T> {
    try {
        return await queryFn();
    } catch (error) {
        handleDatabaseError(error as Error, operation);
    }
}

/**
 * Executes a database query that may return null with error handling
 *
 * Similar to withDbQuery, but specifically for queries that might legitimately
 * return null (like finding a record by ID). This prevents null results
 * from being treated as errors.
 *
 * @param queryFn - The database query function to execute
 * @param operation - Description of the operation (for error messages)
 * @returns The result of the query function or null
 * @example
 * ```
 * const user = await withDbQueryNullable(
 *   () => db.select().from(users).where(eq(users.id, userId)).limit(1),
 *   'find user by ID'
 * );
 * ```
 */
export async function withDbQueryNullable<T>({
    queryFn,
    operation = 'database operation (may return null)',
}: {
    queryFn: () => Promise<T>;
    operation?: string;
}): Promise<T | null> {
    try {
        return await queryFn();
    } catch (error) {
        handleDatabaseError(error as Error, operation);
    }
}

/**
 * Executes a database query with input and/or output validation using zod schemas
 *
 * @param options - Configuration options
 * @param options.queryFn - Function that performs the database operation
 * @param options.inputSchema - Optional zod schema to validate input data
 * @param options.outputSchema - Optional zod schema to validate query results
 * @param options.inputData - Optional input data to validate (required if inputSchema is provided)
 * @param options.operation - Description of the operation (for error messages)
 * @returns The validated result of the database operation
 *
 * @example
 * ```
 * // Validate both input and output
 * const userInsertSchema = createInsertSchema(users);
 * const userSelectSchema = createSelectSchema(users);
 *
 * const newUser = await withDbQueryValidated({
 *   inputSchema: userInsertSchema,
 *   outputSchema: userSelectSchema,
 *   inputData: { name: 'John', email: 'john@example.com' },
 *   queryFn: async (validData) => {
 *     return db.insert(users).values(validData).returning();
 *   },
 *   operation: 'insert user'
 * });
 * ```
 */
export async function withDbQueryValidated<
    TOutput = unknown,
    TInputSchema extends z.ZodSchema<any, any> = z.ZodSchema<any, any>,
    TOutputSchema extends z.ZodSchema<TOutput, any, any> = z.ZodSchema<TOutput, any, any>,
>({
    queryFn,
    inputSchema,
    outputSchema,
    inputData,
    operation = 'validated database operation',
}: {
    queryFn: (validatedInput: z.infer<TInputSchema>) => Promise<TOutput>;
    inputSchema?: TInputSchema;
    outputSchema?: TOutputSchema;
    inputData?: unknown;
    operation?: string;
}): Promise<TOutput> {
    const result = await executeDbQueryValidated<
        TOutput,
        z.infer<TInputSchema>,
        TInputSchema,
        TOutputSchema
    >({
        queryFn,
        inputSchema,
        outputSchema,
        inputData,
        operation,
        executor: withDbQuery,
    });

    if (result === null) {
        throw errorFactory.createDatabaseError({
            message: `Database returned null for ${operation}`,
            code: 'DB.QUERY_NULL_RETURNED',
            cause: new Error(`Database returned null for ${operation}`),
        });
    }
    return result;
}

/**
 * Executes a database query with input and/or output validation that may return null
 *
 * @param options - Configuration options
 * @param options.queryFn - Function that performs the database operation
 * @param options.inputSchema - Optional zod schema to validate input data
 * @param options.outputSchema - Optional zod schema to validate query results
 * @param options.inputData - Optional input data to validate (required if inputSchema is provided)
 * @param options.operation - Description of the operation (for error messages)
 * @returns The validated result of the database operation or null
 *
 * @example
 * ```
 * // Find a user by ID with output validation
 * const user = await withDbQueryValidatedNullable({
 *   outputSchema: userSelectSchema,
 *   queryFn: async () => {
 *     return db.query.users.findFirst({
 *       where: eq(users.id, userId)
 *     });
 *   },
 *   operation: 'find user by ID'
 * });
 * ```
 */
export async function withDbQueryValidatedNullable<
    TOutput = unknown,
    TInputSchema extends z.ZodSchema<any, any> = z.ZodSchema<any, any>,
    TOutputSchema extends z.ZodSchema<TOutput, any, any> = z.ZodSchema<TOutput, any, any>,
>({
    queryFn,
    inputSchema,
    outputSchema,
    inputData,
    operation = 'validated database operation (may return null)',
}: {
    queryFn: (validatedInput: z.infer<TInputSchema>) => Promise<TOutput>;
    inputSchema?: TInputSchema;
    outputSchema?: TOutputSchema;
    inputData?: unknown;
    operation?: string;
}): Promise<TOutput | null> {
    return executeDbQueryValidated<TOutput, z.infer<TInputSchema>, TInputSchema, TOutputSchema>({
        queryFn,
        inputSchema,
        outputSchema,
        inputData,
        operation,
        executor: withDbQueryNullable,
    });
}
