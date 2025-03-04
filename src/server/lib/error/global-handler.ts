import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { BaseError } from './base';
import { errorFactory } from './factory';
import { handleZodError } from './validation';

/**
 * Global error handler for Hono applications
 *
 * This function handles all errors thrown during request processing and transforms them
 * into structured API responses with appropriate status codes. It handles:
 *
 * - BaseError: Our custom error type with built-in status codes and error details
 * - ZodError: Validation errors from Zod schema validation
 * - HTTPException: Errors thrown by Hono itself
 * - Unknown errors: Any other errors that might occur
 *
 * @param error - The error that was thrown
 * @param c - The Hono context
 * @returns A JSON response with the appropriate error information
 */
export const handleError = (error: Error, c: Context) => {
    console.error('Error in Hono application:', error);

    // Handle BaseError (our custom error type)
    if (error instanceof BaseError) {
        error.logError();
        return c.json(error.toResponse(), error.statusCode);
    }

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
        const validationError = handleZodError(error);
        validationError.logError();
        return c.json(validationError.toResponse(), validationError.statusCode);
    }

    // Handle Hono HTTP exceptions
    if (error instanceof HTTPException) {
        const baseError = errorFactory.createError({
            message: error.message || 'HTTP error occurred',
            code: 'INTERNAL_SERVER_ERROR',
            statusCode: error.status,
            layer: 'route',
        });
        baseError.logError();
        return c.json(baseError.toResponse(), error.status);
    }

    // Log the original error for debugging
    console.error('Unhandled error in Hono application:', error);

    // Unknown errors
    const status = 500;
    const baseError = errorFactory.createError({
        message: 'An unexpected error occurred',
        code: 'INTERNAL_SERVER_ERROR',
        statusCode: status,
        cause: error instanceof Error ? error : undefined,
        layer: 'route',
    });
    baseError.logError();
    return c.json(baseError.toResponse(), status);
};
