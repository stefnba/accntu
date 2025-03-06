/**
 * Database Handler Utilities
 *
 * This module provides utilities for handling database operations with
 * consistent error handling, validation, and response formatting.
 */

import { z } from 'zod';
import { BaseError } from '../error/base';
import { errorFactory } from '../error/factory';

/**
 * Type-safe database query wrapper with validation and error handling
 *
 * This function provides a unified interface for database operations with:
 * - Input validation using Zod schemas
 * - Output validation using Zod schemas
 * - Null handling with type safety
 * - Consistent error handling and formatting
 *
 * Type safety is enforced through overloads:
 * - When allowNull=false (default): Ensures query returns non-null value
 * - When allowNull=true: Allows query to return null
 *
 * @example
 * // Non-nullable query with validation
 * const result = await withDbQuery({
 *   queryFn: (input) => db.insert(user).values(input).returning(),
 *   inputSchema: userSchema,
 *   outputSchema: userSchema,
 *   inputData: userData,
 *   allowNull: false
 * });
 *
 * // Nullable query without validation
 * const result = await withDbQuery({
 *   queryFn: () => db.select().from(user).where(eq(user.id, '1')),
 *   allowNull: true
 * });
 *
 * @param options - Configuration options
 * @param options.queryFn - The database query function to execute
 * @param options.operation - Description of the operation (for error messages)
 * @param options.inputSchema - Optional zod schema to validate input data
 * @param options.outputSchema - Optional zod schema to validate query results
 * @param options.inputData - Optional input data to validate (required if inputSchema is provided)
 * @param options.allowNull - Whether to allow null results (defaults to false)
 * @returns The validated result of the query function
 * @throws {ValidationError} If input/output validation fails
 * @throws {DatabaseError} If query fails or returns null when not allowed
 */
export async function withDbQuery<
    TOutput,
    TInputSchema extends z.ZodSchema<any, any> = z.ZodSchema<any, any>,
    TOutputSchema extends z.ZodSchema<TOutput, any, any> = z.ZodSchema<TOutput, any, any>,
>({
    queryFn,
    operation,
    inputSchema,
    outputSchema,
    inputData,
    allowNull,
}: {
    queryFn: (validatedInput: z.infer<TInputSchema>) => Promise<TOutput>;
    operation?: string;
    inputSchema?: TInputSchema;
    outputSchema?: TOutputSchema;
    inputData?: unknown;
    allowNull?: false;
}): Promise<TOutput>;

export async function withDbQuery<
    TOutput,
    TInputSchema extends z.ZodSchema<any, any> = z.ZodSchema<any, any>,
    TOutputSchema extends z.ZodSchema<TOutput | null, any, any> = z.ZodSchema<
        TOutput | null,
        any,
        any
    >,
>({
    queryFn,
    operation,
    inputSchema,
    outputSchema,
    inputData,
    allowNull,
}: {
    queryFn: (validatedInput: z.infer<TInputSchema>) => Promise<TOutput | null>;
    operation?: string;
    inputSchema?: TInputSchema;
    outputSchema?: TOutputSchema;
    inputData?: unknown;
    allowNull?: true;
}): Promise<TOutput | null>;

export async function withDbQuery<
    TOutput,
    TInputSchema extends z.ZodSchema<any, any> = z.ZodSchema<any, any>,
    TOutputSchema extends z.ZodSchema<TOutput | null, any, any> = z.ZodSchema<
        TOutput | null,
        any,
        any
    >,
>({
    queryFn,
    operation = 'database operation',
    inputSchema,
    outputSchema,
    inputData,
    allowNull = false,
}: {
    queryFn: (validatedInput: z.infer<TInputSchema>) => Promise<TOutput | null>;
    operation?: string;
    inputSchema?: TInputSchema;
    outputSchema?: TOutputSchema;
    inputData?: unknown;
    allowNull?: boolean;
}): Promise<TOutput | null> {
    try {
        // Validate input data if schema is provided
        let validatedInput: z.infer<TInputSchema> | undefined = undefined;

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
        const result = await queryFn(validatedInput);

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

        // Handle null results based on allowNull flag and output schema
        if (result === null) {
            if (!allowNull || (outputSchema && !outputSchema.safeParse(null).success)) {
                throw errorFactory.createDatabaseError({
                    message: `Database returned null for ${operation}`,
                    code: 'DB.QUERY_NULL_RETURNED',
                    cause: new Error(`Database returned null for ${operation}`),
                });
            }
            return null;
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
