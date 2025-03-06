import { Context } from 'hono';
import { ZodError } from 'zod';
import { logger } from '../logger';
import { errorFactory } from './factory';

/**
 * Handles Zod validation errors by transforming them into a standardized error response
 * @param error The Zod validation error
 * @param c Optional Hono context for request-specific information
 */
export const handleZodError = (error: ZodError, c?: Context) => {
    // Extract field errors into a more readable format
    const fieldErrors = error.errors.reduce(
        (acc, curr) => {
            const path = curr.path.join('.');
            acc[path] = curr.message;
            return acc;
        },
        {} as Record<string, string>
    );

    // Log validation error with details
    logger.warn('Validation error', {
        context: 'validation',
        data: { fields: fieldErrors },
        error: error,
    });

    // Create and throw a validation error with field details
    throw errorFactory.createValidationError({
        message: 'Validation error',
        code: 'VALIDATION.INVALID_INPUT',
        details: {
            fields: fieldErrors,
            original: error,
        },
    });
};

import { zValidator as zv } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import { ZodSchema } from 'zod';

/**
 * Centralized Zod validator that throws a ZodError when validation fails and hence falls back to our custom error handler
 *
 * This is used to validate the request body, query, cookie and params in the routes
 */
export const zValidator = <T extends ZodSchema, Target extends keyof ValidationTargets>(
    target: Target,
    schema: T
) =>
    zv(target, schema, (result) => {
        if (!result.success) {
            // convert and forward the error to our custom error handler
            throw handleZodError(result.error);
            // throw new ZodError(result.error.issues);
        }
    });
