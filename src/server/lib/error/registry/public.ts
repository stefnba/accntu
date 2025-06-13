import { DotNotationFromNestedObjectArray } from './types';
import { createPublicErrorEntry } from './utils';

/**
 * Public error codes that can be returned to clients
 *
 * This file contains the definition of public error codes that are safe to return
 * to clients. These are designed to provide meaningful error information without
 * exposing implementation details.
 */

/**
 * Registry of public error codes organized by category
 * These are the error codes that can be safely returned to clients
 */
export const PUBLIC_ERROR_REGISTRY = {
    AUTH: [
        // User doesn't have permission
        createPublicErrorEntry({
            code: 'UNAUTHORIZED',
            message: 'You are not authorized to access this resource',
        }),
        // Invalid credentials
        createPublicErrorEntry({
            code: 'LOGIN_FAILED',
            message: 'Invalid credentials provided',
        }),
        // Session is no longer valid
        createPublicErrorEntry({
            code: 'SESSION_EXPIRED',
            message: 'Your session has expired. Please sign in again',
        }),
        // OTP/email verification issues
        createPublicErrorEntry({
            code: 'VERIFICATION_FAILED',
            message: 'OTP/email verification issues',
        }),
        // Account is locked for security reasons
        createPublicErrorEntry({
            code: 'ACCOUNT_LOCKED',
            message: 'Your account is locked for security reasons',
        }),
    ],
    VALIDATION: [
        // General invalid input
        createPublicErrorEntry({
            code: 'INVALID_INPUT',
            message: 'General invalid input',
        }),
        // Required field is missing
        createPublicErrorEntry({
            code: 'MISSING_FIELD',
            message: 'Required field is missing',
        }),
        // Input format is incorrect (email, phone, etc.)
        createPublicErrorEntry({
            code: 'INVALID_FORMAT',
            message: 'Input format is incorrect (email, phone, etc.)',
        }),
    ],
    RESOURCE: [
        // Resource doesn't exist
        createPublicErrorEntry({
            code: 'NOT_FOUND',
            message: 'Resource does not exist',
        }),
        // Resource already exists
        createPublicErrorEntry({
            code: 'ALREADY_EXISTS',
            message: 'Resource already exists',
        }),
    ],
    OPERATION: [
        // Failed to create resource
        createPublicErrorEntry({
            code: 'CREATE_FAILED',
            message: 'Failed to create resource',
        }),
        // Failed to update resource
        createPublicErrorEntry({
            code: 'UPDATE_FAILED',
            message: 'Failed to update resource',
        }),
        // Failed to delete resource
        createPublicErrorEntry({
            code: 'DELETE_FAILED',
            message: 'Failed to delete resource',
        }),
    ],
    RATE_LIMIT: [
        // Rate limit exceeded
        createPublicErrorEntry({
            code: 'TOO_MANY_REQUESTS',
            message: 'Rate limit exceeded',
        }),
        // Temporarily blocked due to suspicious activity
        createPublicErrorEntry({
            code: 'TEMPORARY_BLOCK',
            message: 'Temporarily blocked due to suspicious activity',
        }),
    ],
    SERVER: [
        // Unexpected server error
        createPublicErrorEntry({
            code: 'INTERNAL_ERROR',
            message: 'An unexpected server error occurred',
        }),
        // Service is temporarily unavailable
        createPublicErrorEntry({
            code: 'SERVICE_UNAVAILABLE',
            message: 'Service is temporarily unavailable',
        }),
        // System is under maintenance
        createPublicErrorEntry({
            code: 'MAINTENANCE',
            message: 'System is under maintenance',
        }),
    ],
} as const;

export type TPublicErrorCode = DotNotationFromNestedObjectArray<typeof PUBLIC_ERROR_REGISTRY>;
export type TPublicErrorCategory = keyof typeof PUBLIC_ERROR_REGISTRY;
export type TPublicErrorShortCode = TPublicErrorCode extends `${infer _}.${infer Name}`
    ? Name
    : never;
