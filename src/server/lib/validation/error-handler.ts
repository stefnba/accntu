import { AppErrors } from '@/server/lib/error';
import { logger } from '@/server/lib/logger';
import { Context } from 'hono';
import { ZodError, ZodType } from 'zod';

import { $ZodError } from 'zod/v4/core';

/**
 * Handles Zod validation errors by transforming them into a standardized error response
 * @param error The Zod validation error
 * @param c Optional Hono context for request-specific information
 */
export const handleZodError = <T extends ZodType>(
    error: ZodError<T> | $ZodError<T> | $ZodError<unknown>,
    c?: Context
) => {
    // Extract field errors into a more readable format
    const fieldErrors = error.issues.reduce(
        (acc: Record<string, string>, curr: any) => {
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
    throw AppErrors.validation('INVALID_FORMAT', {
        message: 'Validation error',
        details: {
            fields: fieldErrors,
            original: error,
        },
    });
};
