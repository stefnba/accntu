import { DotNotationFromObjectType } from './types';

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
export const PublicErrorCodesByCategory = {
    AUTH: [
        'UNAUTHORIZED', // User doesn't have permission
        'LOGIN_FAILED', // Invalid credentials
        'SESSION_EXPIRED', // Session is no longer valid
        'VERIFICATION_FAILED', // OTP/email verification issues
        'ACCOUNT_LOCKED', // Account is locked for security reasons
    ],
    VALIDATION: [
        'INVALID_INPUT', // General invalid input
        'MISSING_FIELD', // Required field is missing
        'INVALID_FORMAT', // Input format is incorrect (email, phone, etc.)
        'DUPLICATE_ENTRY', // Trying to create something that already exists
    ],
    RESOURCE: [
        'NOT_FOUND', // Resource doesn't exist
        'ALREADY_EXISTS', // Resource already exists
        'ACCESS_DENIED', // User doesn't have access to this resource
        'CONFLICT', // Operation conflicts with current state
    ],
    OPERATION: [
        'CREATE_FAILED', // Failed to create resource
        'UPDATE_FAILED', // Failed to update resource
        'DELETE_FAILED', // Failed to delete resource
        'OPERATION_REJECTED', // Operation rejected by business rules
    ],
    RATE_LIMIT: [
        'TOO_MANY_REQUESTS', // Rate limit exceeded
        'TEMPORARY_BLOCK', // Temporarily blocked due to suspicious activity
    ],
    SERVER: [
        'INTERNAL_ERROR', // Unexpected server error
        'SERVICE_UNAVAILABLE', // Service is temporarily unavailable
        'MAINTENANCE', // System is under maintenance
    ],
} as const;

// todo change to TPublicErrorCode
/**
 * Type for public error codes in dot notation format
 */
export type TPublicErrorCodes = DotNotationFromObjectType<typeof PublicErrorCodesByCategory>;

/**
 * Type for public error categories
 */
export type TPublicErrorCategories = keyof typeof PublicErrorCodesByCategory;
