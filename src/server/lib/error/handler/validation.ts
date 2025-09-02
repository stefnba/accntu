import { logger } from '@/server/lib/logger';
import { Context } from 'hono';
import { ZodError } from 'zod';
import { errorFactory } from '../factory';

/**
 * Handles Zod validation errors by transforming them into a standardized error response
 * @param error The Zod validation error
 * @param c Optional Hono context for request-specific information
 */
export const handleZodError = (error: ZodError, c?: Context) => {
    // Extract field errors into a more readable format
    const fieldErrors = error.issues.reduce(
        (acc: any, curr: any) => {
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
        code: 'VALIDATION_ERROR',
        details: {
            fields: fieldErrors,
            original: error,
        },
    });
};
