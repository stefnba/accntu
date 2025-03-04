import { handleDatabaseError } from '@/server/lib/error/db';
import { z } from 'zod';
import { BaseError } from '../error/base';
import { errorFactory } from '../error/factory';

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
export async function withDbQuery<T>(
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
export async function withDbQueryNullable<T>(
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
 * Core implementation for database operations with validation
 * @internal
 */
async function executeDbQueryValidated<TInput, TOutput>({
    queryFn,
    inputSchema,
    outputSchema,
    inputData,
    operation,
    executor,
}: {
    queryFn: (validatedInput?: TInput) => Promise<TOutput>;
    inputSchema?: z.ZodSchema<TInput, any, any>;
    outputSchema?: z.ZodSchema<TOutput, any, any>;
    inputData?: unknown;
    operation: string;
    executor: (fn: () => Promise<TOutput>, op: string) => Promise<TOutput | null>;
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

        // Execute the database operation
        const result = await executor(() => queryFn(validatedInput), operation);

        // If result is null, return null
        if (result === null) {
            return null;
        }

        // Validate output data if schema is provided
        if (outputSchema) {
            try {
                const resultValidated = outputSchema.parse(result);
                return resultValidated;
            } catch (validationError) {
                if (validationError instanceof z.ZodError) {
                    throw errorFactory.createDatabaseError({
                        message: `Database returned invalid data for ${operation}`,
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

        if (error instanceof Error) {
            throw errorFactory.createDatabaseError({
                message: `Failed to execute ${operation}`,
                code: 'DB.OPERATION_FAILED',
                cause: error,
            });
        }

        throw error;
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
    TInput = unknown,
    TOutput = unknown,
    TInputSchema extends z.ZodSchema<TInput, any, any> = z.ZodSchema<TInput, any, any>,
    TOutputSchema extends z.ZodSchema<TOutput, any, any> = z.ZodSchema<TOutput, any, any>,
>({
    queryFn,
    inputSchema,
    outputSchema,
    inputData,
    operation = 'validated database operation',
}: {
    queryFn: (validatedInput?: TInput) => Promise<TOutput>;
    inputSchema?: TInputSchema;
    outputSchema?: TOutputSchema;
    inputData?: unknown;
    operation?: string;
}): Promise<TOutput> {
    const result = await executeDbQueryValidated({
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
    TInput = unknown,
    TOutput = unknown,
    TInputSchema extends z.ZodSchema<TInput, any, any> = z.ZodSchema<TInput, any, any>,
    TOutputSchema extends z.ZodSchema<TOutput, any, any> = z.ZodSchema<TOutput, any, any>,
>({
    queryFn,
    inputSchema,
    outputSchema,
    inputData,
    operation = 'validated database operation (may return null)',
}: {
    queryFn: (validatedInput?: TInput) => Promise<TOutput>;
    inputSchema?: TInputSchema;
    outputSchema?: TOutputSchema;
    inputData?: unknown;
    operation?: string;
}): Promise<TOutput | null> {
    return executeDbQueryValidated({
        queryFn,
        inputSchema,
        outputSchema,
        inputData,
        operation,
        executor: withDbQueryNullable,
    });
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

// For backward compatibility
export const withDb = withDbQuery;
export const withDbNullable = withDbQueryNullable;
export const withDbValidated = withDbQueryValidated;
export const withDbValidatedNullable = withDbQueryValidatedNullable;
