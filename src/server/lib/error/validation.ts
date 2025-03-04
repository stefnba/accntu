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
