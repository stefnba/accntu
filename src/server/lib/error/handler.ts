import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { errorFactory } from './factory';
import { isBaseError, isError } from './utils';

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
export const handleError = (error: unknown, c: Context) => {
    // Handle our custom BaseError
    if (isBaseError(error)) {
        // First set the status code from the error
        c.status(error.statusCode);

        // Create request data with the correct status
        const requestData = {
            method: c.req.method,
            url: c.req.url,
            status: error.statusCode, // Use error's status code directly
        };

        // Use full logging for unexpected errors, simplified for expected ones
        const isExpectedError = error.errorDefinition.isExpected;
        error.logError(requestData, {
            includeChain: true, // Always include chain in logs
            includeStack: !isExpectedError, // Only include stack for unexpected errors
        });

        return c.json(error.toResponse());
    }

    // Handle Hono HTTP exceptions (404, etc.)
    if (error instanceof HTTPException) {
        // First set the status code
        c.status(error.status);

        const baseError = errorFactory.createError({
            message: error.message || 'HTTP error occurred',
            code: 'SERVER.INTERNAL_ERROR',
            statusCode: error.status,
            layer: 'route',
        });

        // Create request data with the correct status
        const requestData = {
            method: c.req.method,
            url: c.req.url,
            status: error.status,
        };

        baseError.logError(requestData);
        return c.json(baseError.toResponse());
    }

    // Handle unknown errors as critical errors
    const statusCode = 500;

    // First set the status code
    c.status(statusCode);

    const baseError = errorFactory.createError({
        message: isError(error) ? error.message : 'An unexpected error occurred',
        code: 'SERVER.INTERNAL_ERROR',
        statusCode,
        cause: isError(error) ? error : undefined,
        layer: 'route',
        details: isError(error) ? { stack: error.stack } : {},
    });

    // Create request data with the correct status
    const requestData = {
        method: c.req.method,
        url: c.req.url,
        status: statusCode,
    };

    baseError.logError(requestData);
    return c.json(baseError.toResponse());
};
