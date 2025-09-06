/**
 * Database Handler Utilities
 *
 * This module provides utilities for handling database operations with
 * consistent error handling, validation, and response formatting.
 */

import { z } from 'zod';
import { BaseError } from '../error/base';
import { errorFactory } from '../error/factory';
import { logDevError, shouldUseDevFormatting } from '../error/dev-formatter';

/**
 * Type-safe database query wrapper with validation and error handling
 *
 * This function provides a unified interface for database operations with:
 * - Input validation using Zod schemas
 * - Output validation using Zod schemas (handles nullability)
 * - Null handling with type safety (when no output schema)
 * - Consistent error handling and formatting
 *
 * Type safety is enforced through overloads:
 * - With outputSchema: Schema defines nullability
 * - Without outputSchema: allowNull parameter controls nullability
 *
 * @example
 * // Schema-validated query (nullability defined in schema)
 * const result = await withDbQuery({
 *   queryFn: (input) => db.insert(user).values(input).returning(),
 *   inputSchema: userSchema,
 *   outputSchema: userSchema, // schema defines if null is allowed
 *   inputData: userData,
 * });
 *
 * // Query without schema validation
 * const result = await withDbQuery({
 *   queryFn: () => db.select().from(user).where(eq(user.id, '1')),
 *   allowNull: true // only used when no outputSchema
 * });
 */
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
}: {
    queryFn: (validatedInput: z.infer<TInputSchema>) => Promise<TOutput | null>;
    operation?: string;
    inputSchema?: TInputSchema;
    outputSchema: TOutputSchema;
    inputData?: unknown;
}): Promise<z.infer<TOutputSchema>>;

export async function withDbQuery<
    TOutput,
    TInputSchema extends z.ZodSchema<any, any> = z.ZodSchema<any, any>,
>({
    queryFn,
    operation,
    inputSchema,
    inputData,
    allowNull,
}: {
    queryFn: (validatedInput: z.infer<TInputSchema>) => Promise<TOutput | null>;
    operation?: string;
    inputSchema?: TInputSchema;
    inputData?: unknown;
    allowNull: true;
}): Promise<TOutput | null>;

export async function withDbQuery<
    TOutput,
    TInputSchema extends z.ZodSchema<any, any> = z.ZodSchema<any, any>,
>({
    queryFn,
    operation,
    inputSchema,
    inputData,
    allowNull,
}: {
    queryFn: (validatedInput: z.infer<TInputSchema>) => Promise<TOutput>;
    operation?: string;
    inputSchema?: TInputSchema;
    inputData?: unknown;
    allowNull?: false;
}): Promise<TOutput>;

export async function withDbQuery<
    TOutput,
    TInputSchema extends z.ZodSchema<any, any> = z.ZodSchema<any, any>,
    TOutputSchema extends z.ZodSchema<any, any> = z.ZodSchema<any, any>,
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
    // Validate input data if schema is provided
    let validatedInput: z.infer<TInputSchema>;

    if (inputSchema) {
        if (inputData === undefined) {
            throw new Error('Input data must be provided when inputSchema is specified');
        }

        const validatedInputParsed = inputSchema.safeParse(inputData);

        if (validatedInputParsed.error) {
            throw errorFactory.createDatabaseError({
                message: `Invalid input data for ${operation}`,
                code: 'INVALID_INPUT',
                cause: validatedInputParsed.error,
                details: { zodErrors: validatedInputParsed.error.issues },
            });
        }

        validatedInput = validatedInputParsed.data;
    } else {
        // When no input schema, pass an empty object as validatedInput
        validatedInput = {} as z.infer<TInputSchema>;
    }

    try {
        // Execute the query
        const result = (await queryFn(validatedInput)) ?? null;

        // If we have an output schema, use it for validation (including null handling)
        if (outputSchema) {
            const validatedOutputParsed = outputSchema.safeParse(result);

            if (validatedOutputParsed.error) {
                throw errorFactory.createDatabaseError({
                    message: `Invalid output data from '${operation}'`,
                    code: 'INVALID_OUTPUT',
                    cause: validatedOutputParsed.error,
                    details: { zodErrors: validatedOutputParsed.error.issues },
                });
            }

            return validatedOutputParsed.data;
        }

        // Handle null results when no output schema is provided
        if (result === null && !allowNull) {
            throw errorFactory.createDatabaseError({
                message: `Database returned null for '${operation}'`,
                code: 'QUERY_NULL_RETURNED',
                cause: new Error(`Database returned null for ${operation}`),
            });
        }

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
}
