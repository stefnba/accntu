import { MiddlewareHandler } from 'hono';
import { z } from 'zod';
import { errorFactory } from './factory';

/**
 * Handles Zod validation errors and transforms them into structured errors
 *
 * This function takes a Zod validation error and transforms it into our
 * standardized BaseError format with appropriate error codes and messages.
 * It extracts field-specific error messages and formats them in a consistent way.
 *
 * @param error - The Zod validation error to handle
 * @returns A BaseError with validation error details
 */
export function handleZodError(error: z.ZodError) {
    const fieldErrors = error.errors.reduce(
        (acc, err) => {
            const path = err.path.join('.');
            acc[path] = err.message;
            return acc;
        },
        {} as Record<string, string>
    );

    return errorFactory.createValidationError({
        message: 'Validation error',
        code: 'VALIDATION.INVALID_INPUT',
        cause: error,
        statusCode: 400,
        details: {
            fields: fieldErrors,
        },
    });
}

/**
 * Middleware that catches Zod validation errors and transforms them
 * into structured validation errors
 *
 * This middleware can be used in routes where you want to handle Zod
 * validation errors specifically, separate from the global error handler.
 * It catches Zod errors and transforms them into BaseErrors with detailed
 * validation information.
 *
 * @returns A Hono middleware handler for Zod validation errors
 */
export const zodValidationErrorHandler = (): MiddlewareHandler => async (c, next) => {
    try {
        await next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw handleZodError(error);
        }
        throw error;
    }
};
