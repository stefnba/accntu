// src/server/error/middleware.ts
import { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { z } from 'zod';
import { BaseError } from './base';
import { errorFactory } from './factory';
import { handleZodError } from './validation';

/**
 * Error handler middleware for Hono applications
 *
 * This middleware catches all errors thrown during request processing and transforms them
 * into structured API responses with appropriate status codes. It handles different types
 * of errors:
 *
 * 1. BaseError - Our custom error type with built-in status codes and error details
 * 2. ZodError - Validation errors from Zod schema validation
 * 3. HTTPException - Errors thrown by Hono itself
 * 4. Unknown errors - Any other errors that might occur
 *
 * Each error type is transformed into a consistent API response format defined in
 * APIErrorResponse, ensuring clients receive standardized error information.
 *
 * @returns A Hono middleware handler that processes errors
 */
export const errorHandler = (): MiddlewareHandler => async (c, next) => {
    try {
        await next();
    } catch (error) {
        console.error('Error in errorHandler middleware:', error);

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
                message: error.message,
                code: 'INTERNAL_SERVER_ERROR',
                statusCode: error.status,
                layer: 'route',
            });
            baseError.logError();
            return c.json(baseError.toResponse(), error.status);
        }

        // Unknown errors
        const status: ContentfulStatusCode = 500;
        const baseError = errorFactory.createError({
            message: 'An unexpected error occurred',
            code: 'INTERNAL_SERVER_ERROR',
            statusCode: status,
            cause: error instanceof Error ? error : undefined,
            layer: 'route',
        });
        baseError.logError();
        return c.json(baseError.toResponse(), status);
    }
};
