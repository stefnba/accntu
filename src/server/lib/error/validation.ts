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
    // Extract field errors into a structured format
    const fieldErrors = error.errors.reduce(
        (acc, err) => {
            const path = err.path.join('.');
            acc[path] = err.message;
            return acc;
        },
        {} as Record<string, string>
    );

    console.log('handleZodError fieldErrors', fieldErrors);

    // Create a validation error with the field errors as details
    return errorFactory.createValidationError({
        message: 'Validation error',
        code: 'VALIDATION.INVALID_INPUT',
        cause: error,
        statusCode: 400,
        details: {
            fields: fieldErrors,
            // Include the original error format for debugging
            original: error.format(),
        },
    });
}

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
