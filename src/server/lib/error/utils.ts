import { nanoid } from 'nanoid';
import { BaseError } from './base';

/**
 * Type guard to check if an unknown value is a BaseError
 *
 * @param error - The value to check
 * @returns True if the value is a BaseError
 */
export function isBaseError(error: unknown): error is BaseError {
    return !!error && typeof error === 'object' && error instanceof BaseError;
}

/**
 * Type guard to check if an unknown value is a standard Error
 *
 * @param error - The value to check
 * @returns True if the value is a standard Error
 */
export function isError(error: unknown): error is Error {
    return !!error && typeof error === 'object' && error instanceof Error;
}

/**
 * Extracts the error message from an unknown error
 *
 * @param error - Any error object
 * @returns A string representation of the error message
 */
export function getErrorMessage(error: unknown): string {
    if (isBaseError(error)) {
        return error.message;
    }

    if (isError(error)) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return JSON.stringify(error);
}

/**
 * Generates a short, unique error ID for use in error tracing
 *
 * Uses a more concise format than the default nanoid
 *
 * @returns A unique error trace ID
 */
export function generateErrorId(): string {
    return nanoid(10);
}

/**
 * Creates structured error details object with proper type checking
 *
 * This helper ensures that error details are correctly structured and
 * improves type safety when adding details to errors.
 *
 * @param details - Object containing error details
 * @returns A structured error details object
 */
export function createStructuredErrorDetails<T extends Record<string, unknown>>(details: T): T {
    return details;
}
