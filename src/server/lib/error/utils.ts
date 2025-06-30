import { errorFactory } from '@/server/lib/error/factory';
import { APIError as BetterAuthAPIError } from 'better-auth/api';
import { HTTPException } from 'hono/http-exception';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { nanoid } from 'nanoid';
import { BaseError } from './base';

/**
 * Type guard to check if an unknown value is a Hono HTTPException
 *
 * @param error - The value to check
 * @returns True if the value is an HTTPException
 */
export function isHTTPException(error: unknown): error is HTTPException {
    return !!error && typeof error === 'object' && error instanceof HTTPException;
}

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
 * Type guard to check if an unknown value is a better-auth APIError
 *
 * @param error - The value to check
 * @returns True if the value is an APIError from better-auth
 */
export function isBetterAuthAPIError(error: unknown): error is BetterAuthAPIError {
    return !!error && typeof error === 'object' && error instanceof BetterAuthAPIError;
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
 * Generates a short, unique error ID for use in error tracing
 *
 * Uses a more concise format than the default nanoid
 *
 * @returns A unique error trace ID
 */
export function generateErrorId(): string {
    return nanoid(10);
}

export type TErrorDataResult = {
    error: BaseError;
    originalError: unknown;
};

/**
 * Converts an unknown error to a BaseError
 *
 * @param error - The error to convert
 * @returns A BaseError
 */
export const convertToAppError = (error: unknown): TErrorDataResult => {
    // If the error is already a BaseError, return it
    if (isBaseError(error)) {
        return { error, originalError: error };
    }

    // If the error is a Hono HTTPException, create a BaseError from it
    if (isHTTPException(error)) {
        return {
            error: errorFactory.createError({
                message: error.message || 'HTTP error occurred',
                code: 'INTERNAL_ERROR',
                type: 'SERVER',
                statusCode: error.status,
                details: { error },
                cause: error,
            }),
            originalError: error,
        };
    }

    // If the error is a better-auth APIError, create a BaseError from it
    if (isBetterAuthAPIError(error)) {
        return {
            error: errorFactory.createError({
                message: error.message || 'BetterAuth error occurred',
                code: 'DEFAULT',
                type: 'BETTER_AUTH',
                statusCode: error.statusCode as ContentfulStatusCode,
                details: {
                    betterAuthError: error,
                    status: error.status,
                },
                cause: error,
            }),
            originalError: error,
        };
    }

    // If the error is an Error, create a BaseError from it
    if (isError(error)) {
        return {
            error: errorFactory.createError({
                message: error.message,
                code: 'INTERNAL_ERROR',
                type: 'SERVER',
                statusCode: 500,
                details: { error },
                cause: error instanceof Error ? error : undefined,
            }),
            originalError: error,
        };
    }

    return {
        error: errorFactory.createError({
            message: 'Unknown error',
            code: 'INTERNAL_ERROR',
            type: 'SERVER',
            statusCode: 500,
            details: { error },
        }),
        originalError: error,
    };
};
