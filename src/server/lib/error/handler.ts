import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { BaseError } from './base';
import { errorFactory } from './factory';

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
    const requestData = {
        method: c.req.method,
        url: c.req.url,
        status: c.res.status,
    };

    // Handle our custom BaseError
    if (error instanceof BaseError) {
        error.logError(requestData);
        return c.json(error.toResponse(), error.statusCode);
    }

    // Handle Hono HTTP exceptions (404, etc.)
    if (error instanceof HTTPException) {
        const baseError = errorFactory.createError({
            message: error.message || 'HTTP error occurred',
            code: 'SERVER.INTERNAL_ERROR',
            statusCode: error.status,
            layer: 'route',
        });
        baseError.logError(requestData);
        return c.json(baseError.toResponse(), error.status);
    }

    // Handle unknown errors as critical errors
    const baseError = errorFactory.createError({
        message: 'An unexpected error occurred',
        code: 'SERVER.INTERNAL_ERROR',
        statusCode: 500,
        cause: error instanceof Error ? error : undefined,
        layer: 'route',
    });
    baseError.logError(requestData);
    return c.json(baseError.toResponse(), 500);
};
