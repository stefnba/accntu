/**
 * Error registry defining all available error codes and their properties
 *
 * This registry serves as the single source of truth for error definitions
 * in the application. All errors should be defined here to ensure consistent
 * error handling throughout the system.
 */

import { DotNotationFromNestedObjectArray } from '@/server/lib/error/registry/types';
import { createErrorEntry, getErrorDefinitionFromRegistry } from './utils';

export { getErrorDefinitionFromRegistry };

/**
 * Create the error registry with proper type validation and complete information
 */
export const ERROR_REGISTRY = {
    // Authentication errors
    AUTH: [
        createErrorEntry({
            code: 'SESSION_TOKEN_NOT_FOUND',
            message: 'The provided session ID was not found in the database',
            statusCode: 401,
            isExpected: true,
            public: {
                code: 'AUTH.UNAUTHORIZED',
            },
        }),
        createErrorEntry({
            code: 'INVALID_SESSION_TOKEN',
            message: 'The provided authentication token is invalid',
            statusCode: 401,
            isExpected: true,
            public: 'AUTH.UNAUTHORIZED',
        }),
        createErrorEntry({
            code: 'EXPIRED_SESSION_TOKEN',
            message: 'The authentication token has expired',
            statusCode: 401,
            isExpected: true,
            public: 'AUTH.SESSION_EXPIRED',
        }),
        createErrorEntry({
            code: 'MISSING_TOKEN',
            message: 'No authentication token was provided',
            statusCode: 401,
            isExpected: true,
            public: {
                code: 'AUTH.UNAUTHORIZED',
                message: 'Authentication required to access this resource',
            },
        }),
        createErrorEntry({
            code: 'INVALID_CREDENTIALS',
            message: 'The provided login credentials are incorrect',
            statusCode: 401,
            isExpected: true,
            public: {
                code: 'AUTH.LOGIN_FAILED',
                message: 'Invalid email or password',
            },
        }),
        createErrorEntry({
            code: 'ACCOUNT_LOCKED',
            message: 'User account has been locked due to too many failed login attempts',
            statusCode: 403,
            isExpected: true,
            public: {
                code: 'AUTH.ACCOUNT_LOCKED',
                message:
                    'Your account has been temporarily locked. Please try again later or reset your password',
            },
        }),
        createErrorEntry({
            code: 'ACCOUNT_DISABLED',
            message: 'User account has been disabled by an administrator',
            statusCode: 403,
            isExpected: true,
            public: {
                code: 'AUTH.ACCOUNT_LOCKED',
                message: 'Your account has been disabled. Please contact support for assistance',
            },
        }),
        createErrorEntry({
            code: 'EMAIL_NOT_VERIFIED',
            message: 'User email has not been verified',
            statusCode: 403,
            isExpected: true,
            public: {
                code: 'AUTH.VERIFICATION_FAILED',
                message: 'Please verify your email address before proceeding',
            },
        }),
        createErrorEntry({
            code: 'INVALID_OTP',
            message: 'Invalid one-time password provided',
            statusCode: 401,
            isExpected: true,
            public: {
                code: 'AUTH.VERIFICATION_FAILED',
                message: 'Invalid verification code. Please try again',
            },
        }),
        createErrorEntry({
            code: 'OTP_EXPIRED',
            message: 'The one-time password has expired',
            statusCode: 401,
            isExpected: true,
            public: {
                code: 'AUTH.VERIFICATION_FAILED',
                message: 'Verification code has expired. Please request a new one',
            },
        }),
        createErrorEntry({
            code: 'OTP_ALREADY_USED',
            message: 'The one-time password has already been used',
            statusCode: 400,
            isExpected: true,
            public: {
                code: 'AUTH.VERIFICATION_FAILED',
                message: 'This verification code has already been used. Please request a new one',
            },
        }),
        createErrorEntry({
            code: 'OTP_NOT_FOUND',
            message: 'No one-time password found for this user/session',
            statusCode: 404,
            isExpected: true,
            public: {
                code: 'AUTH.VERIFICATION_FAILED',
                message: 'Invalid verification code. Please try again',
            },
        }),
        createErrorEntry({
            code: 'OTP_GENERATION_FAILED',
            message: 'Failed to generate a one-time password',
            statusCode: 500,
            isExpected: false,
            public: {
                code: 'SERVER.INTERNAL_ERROR',
                message:
                    'We encountered an error while sending your verification code. Please try again',
            },
        }),
        createErrorEntry({
            code: 'USER_NOT_FOUND',
            message: 'User not found during authentication',
            statusCode: 401,
            isExpected: true,
            public: {
                code: 'AUTH.UNAUTHORIZED',
            },
        }),
        createErrorEntry({
            code: 'USER_NOT_IN_CONTEXT',
            message: 'User information not found in request context',
            statusCode: 401,
            isExpected: true,
            public: {
                code: 'AUTH.UNAUTHORIZED',
            },
        }),
        createErrorEntry({
            code: 'SESSION_NOT_IN_CONTEXT',
            message: 'Session information not found in request context',
            statusCode: 401,
            isExpected: true,
            public: {
                code: 'AUTH.UNAUTHORIZED',
            },
        }),
        createErrorEntry({
            code: 'TOO_MANY_INVALID_REQUESTS',
            message: 'Too many invalid authentication attempts',
            statusCode: 429,
            isExpected: true,
            shouldRetry: true,
            retryAfterSeconds: 300, // 5 minutes
            public: {
                code: 'RATE_LIMIT.TOO_MANY_REQUESTS',
                message: 'Too many failed attempts. Please try again later',
            },
        }),
    ],

    // User management errors
    USER: [
        createErrorEntry({
            code: 'WEAK_PASSWORD',
            message: 'The provided password does not meet security requirements',
            statusCode: 400,
            isExpected: true,
            public: {
                code: 'VALIDATION.INVALID_FORMAT',
                message:
                    'Password must be at least 8 characters and include a mix of letters, numbers, and special characters',
            },
        }),
        createErrorEntry({
            code: 'INVALID_EMAIL',
            message: 'The provided email address is invalid',
            statusCode: 400,
            isExpected: true,
            public: {
                code: 'VALIDATION.INVALID_FORMAT',
                message: 'Please enter a valid email address',
            },
        }),
    ],

    // Data validation errors
    VALIDATION: [
        createErrorEntry({
            code: 'VALIDATION_ERROR',
            message: 'The provided data failed validation',
            statusCode: 400,
            isExpected: true,
            public: {
                code: 'VALIDATION.INVALID_INPUT',
                message: 'The data you provided is invalid',
            },
        }),
        createErrorEntry({
            code: 'MISSING_FIELD',
            message: 'A required field is missing from the request',
            statusCode: 400,
            isExpected: true,
            public: {
                code: 'VALIDATION.MISSING_FIELD',
                message: 'Please provide all required fields',
            },
        }),
        createErrorEntry({
            code: 'INVALID_FORMAT',
            message: 'Data format is invalid for one or more fields',
            statusCode: 400,
            isExpected: true,
            public: {
                code: 'VALIDATION.INVALID_FORMAT',
                message: 'One or more fields have an invalid format',
            },
        }),
        createErrorEntry({
            code: 'PARSE_ERROR',
            message: 'Failed to parse request data',
            statusCode: 400,
            isExpected: true,
            public: {
                code: 'VALIDATION.INVALID_INPUT',
                message: 'Invalid request format',
            },
        }),
    ],

    // Resource errors
    RESOURCE: [
        createErrorEntry({
            code: 'NOT_FOUND',
            message: 'The requested resource was not found',
            statusCode: 404,
            isExpected: true,
            public: {
                code: 'RESOURCE.NOT_FOUND',
                message: 'The resource you requested could not be found',
            },
        }),
        createErrorEntry({
            code: 'ALREADY_EXISTS',
            message: 'A resource with this identifier already exists',
            statusCode: 409,
            isExpected: true,
            public: {
                code: 'RESOURCE.ALREADY_EXISTS',
                message: 'This resource already exists',
            },
        }),
    ],

    // Permission errors
    PERMISSION: [
        createErrorEntry({
            code: 'ACCESS_DENIED',
            message: 'User does not have permission to access this resource',
            statusCode: 403,
            isExpected: true,
            public: 'AUTH.UNAUTHORIZED',
        }),
        createErrorEntry({
            code: 'INSUFFICIENT_ROLE',
            message: 'User does not have the required role for this operation',
            statusCode: 403,
            isExpected: true,
            public: 'AUTH.UNAUTHORIZED',
        }),
    ],

    // Operation errors
    OPERATION: [
        createErrorEntry({
            code: 'CREATE_FAILED',
            message: 'Failed to create the resource',
            statusCode: 500,
            isExpected: false,
            public: {
                code: 'OPERATION.CREATE_FAILED',
                message: 'Failed to create the resource. Please try again',
            },
        }),
        createErrorEntry({
            code: 'UPDATE_FAILED',
            message: 'Failed to update the resource',
            statusCode: 500,
            isExpected: false,
            public: {
                code: 'OPERATION.UPDATE_FAILED',
                message: 'Failed to update the resource. Please try again',
            },
        }),
        createErrorEntry({
            code: 'DELETE_FAILED',
            message: 'Failed to delete the resource',
            statusCode: 500,
            isExpected: false,
            public: {
                code: 'OPERATION.DELETE_FAILED',
                message: 'Failed to delete the resource. Please try again',
            },
        }),
    ],

    // Rate limit errors
    RATE_LIMIT: [
        createErrorEntry({
            code: 'TOO_MANY_REQUESTS',
            message: 'Rate limit exceeded for this endpoint',
            statusCode: 429,
            isExpected: true,
            shouldRetry: true,
            retryAfterSeconds: 60,
            public: {
                code: 'RATE_LIMIT.TOO_MANY_REQUESTS',
                message: 'You have made too many requests. Please try again later',
            },
        }),
        createErrorEntry({
            code: 'QUOTA_EXCEEDED',
            message: 'User has exceeded their quota for this resource',
            statusCode: 429,
            isExpected: true,
            public: {
                code: 'RATE_LIMIT.TOO_MANY_REQUESTS',
                message: 'You have reached your quota limit for this resource',
            },
        }),
    ],

    // Server errors
    SERVER: [
        createErrorEntry({
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred on the server',
            statusCode: 500,
            public: {
                code: 'SERVER.INTERNAL_ERROR',
                message: 'An unexpected error occurred. Please try again later',
            },
            shouldRetry: true,
        }),
        createErrorEntry({
            code: 'SERVICE_UNAVAILABLE',
            message: 'The service is temporarily unavailable',
            statusCode: 503,
            isExpected: true,
            public: {
                code: 'SERVER.SERVICE_UNAVAILABLE',
                message: 'The service is temporarily unavailable. Please try again later',
            },
            shouldRetry: true,
            retryAfterSeconds: 60,
        }),
        createErrorEntry({
            code: 'MAINTENANCE_MODE',
            message: 'The system is currently in maintenance mode',
            statusCode: 503,
            isExpected: true,
            public: {
                code: 'SERVER.MAINTENANCE',
                message: 'The system is currently undergoing maintenance. Please try again later',
            },
            shouldRetry: true,
            retryAfterSeconds: 1800, // 30 minutes
        }),
        createErrorEntry({
            code: 'CONFIGURATION_ERROR',
            message: 'System configuration error detected',
            statusCode: 500,
            isExpected: false,
            public: 'SERVER.INTERNAL_ERROR',
        }),
    ],

    // External service errors
    EXTERNAL: [
        createErrorEntry({
            code: 'SERVICE_ERROR',
            message: 'Error occurred in external service',
            statusCode: 502, // Bad Gateway
            isExpected: true,
            public: {
                code: 'SERVER.SERVICE_UNAVAILABLE',
                message:
                    'We are experiencing issues with an external service. Please try again later',
            },
        }),
        createErrorEntry({
            code: 'TIMEOUT',
            message: 'Timeout occurred when calling external service',
            statusCode: 504, // Gateway Timeout
            isExpected: true,
            public: {
                code: 'SERVER.SERVICE_UNAVAILABLE',
                message: 'The request took too long to process. Please try again later',
            },
            shouldRetry: true,
        }),
        createErrorEntry({
            code: 'INVALID_RESPONSE',
            message: 'Received invalid response from external service',
            statusCode: 502,
            isExpected: true,
            public: {
                code: 'SERVER.SERVICE_UNAVAILABLE',
                message:
                    'We are experiencing issues with an external service. Please try again later',
            },
        }),
        createErrorEntry({
            code: 'API_KEY_INVALID',
            message: 'API key for external service is invalid',
            statusCode: 500,
            isExpected: false,
            public: 'SERVER.INTERNAL_ERROR',
        }),
    ],

    // Database errors
    DB: [
        createErrorEntry({
            code: 'CONNECTION_ERROR',
            message: 'Failed to connect to the database',
            statusCode: 500,
            isExpected: false,
            public: 'SERVER.INTERNAL_ERROR',
        }),
        createErrorEntry({
            code: 'QUERY_FAILED',
            message: 'Database query failed to execute',
            statusCode: 500,
            isExpected: false,
            public: 'SERVER.INTERNAL_ERROR',
            // Internal error, not exposed to clients
        }),
        createErrorEntry({
            code: 'UNIQUE_VIOLATION',
            message: 'Unique constraint violation in database operation',
            statusCode: 409, // Conflict
            isExpected: true,
            public: {
                code: 'RESOURCE.ALREADY_EXISTS',
                message: 'A record with this information already exists',
            },
        }),
        createErrorEntry({
            code: 'FOREIGN_KEY_VIOLATION',
            message: 'Foreign key constraint violation in database operation',
            statusCode: 400,
            isExpected: true,
            public: {
                code: 'VALIDATION.INVALID_INPUT',
                message: 'The referenced resource does not exist or cannot be modified',
            },
        }),
        createErrorEntry({
            code: 'TRANSACTION_FAILED',
            message: 'Database transaction failed to commit',
            statusCode: 500,
            isExpected: false,
            public: 'SERVER.INTERNAL_ERROR',
        }),
        createErrorEntry({
            code: 'INVALID_INPUT',
            message: 'Invalid input data for database operation',
            statusCode: 400,
            isExpected: true,
            public: {
                code: 'VALIDATION.INVALID_INPUT',
                message: 'The provided data is invalid',
            },
        }),
        createErrorEntry({
            code: 'INVALID_OUTPUT',
            message: 'Database returned invalid or unexpected data format',
            statusCode: 500,
            isExpected: false,
            public: 'SERVER.INTERNAL_ERROR',
        }),
        createErrorEntry({
            code: 'QUERY_NULL_RETURNED',
            message: 'Database query returned null when a value was expected',
            statusCode: 404,
            isExpected: true,
            public: {
                code: 'RESOURCE.NOT_FOUND',
                message: 'The requested resource could not be found',
            },
        }),
        createErrorEntry({
            code: 'OPERATION_FAILED',
            message: 'Database operation failed for an unknown reason',
            statusCode: 500,
            isExpected: false,
            public: 'SERVER.INTERNAL_ERROR',
        }),
    ],

    // Cookie errors (previously missing)
    COOKIE: [
        createErrorEntry({
            code: 'INVALID_VALUE',
            message: 'Cookie contains an invalid value',
            statusCode: 400,
            isExpected: true,
            public: {
                code: 'AUTH.UNAUTHORIZED',
                message: 'Your session is invalid. Please sign in again',
            },
        }),
        createErrorEntry({
            code: 'MISSING',
            message: 'Required cookie is missing',
            statusCode: 400,
            isExpected: true,
            public: {
                code: 'AUTH.UNAUTHORIZED',
                message: 'Your session has expired or is missing. Please sign in again',
            },
        }),
        createErrorEntry({
            code: 'EXPIRED',
            message: 'Cookie has expired',
            statusCode: 401,
            isExpected: true,
            public: {
                code: 'AUTH.SESSION_EXPIRED',
                message: 'Your session has expired. Please sign in again',
            },
        }),
        createErrorEntry({
            code: 'TAMPERED',
            message: 'Cookie appears to have been tampered with',
            statusCode: 400,
            isExpected: true,
            public: {
                code: 'AUTH.UNAUTHORIZED',
                message: 'Your session is invalid. Please sign in again',
            },
        }),
    ],

    // Service errors - empty array to maintain the category
    SERVICE: [],

    // File errors
    FILE: [
        createErrorEntry({
            code: 'UPLOAD_FAILED',
            message: 'File upload failed',
            statusCode: 500,
            isExpected: true,
            public: {
                code: 'OPERATION.CREATE_FAILED',
                message: 'Failed to upload file. Please try again',
            },
            shouldRetry: true,
        }),
        createErrorEntry({
            code: 'FILE_TOO_LARGE',
            message: 'Uploaded file exceeds maximum size limit',
            statusCode: 413, // Payload Too Large
            isExpected: true,
            public: {
                code: 'VALIDATION.INVALID_INPUT',
                message: 'The file is too large. Maximum file size is {maxSize}',
            },
        }),
        createErrorEntry({
            code: 'INVALID_FILE_TYPE',
            message: 'File type is not supported',
            statusCode: 415, // Unsupported Media Type
            isExpected: true,
            public: {
                code: 'VALIDATION.INVALID_FORMAT',
                message:
                    'This file type is not supported. Please upload a file in one of these formats: {supportedFormats}',
            },
        }),
        createErrorEntry({
            code: 'FILE_NOT_FOUND',
            message: 'The requested file was not found',
            statusCode: 404,
            isExpected: true,
            public: {
                code: 'RESOURCE.NOT_FOUND',
                message: 'The file you requested could not be found',
            },
        }),
    ],

    // Security errors
    SECURITY: [
        createErrorEntry({
            code: 'SUSPICIOUS_ACTIVITY',
            message: 'Suspicious activity detected on user account',
            statusCode: 403,
            isExpected: true,
            public: {
                code: 'AUTH.ACCOUNT_LOCKED',
                message:
                    'We detected unusual activity on your account. For security reasons, please verify your identity',
            },
        }),
        createErrorEntry({
            code: 'IP_BLOCKED',
            message: 'Request IP address is blocked',
            statusCode: 403,
            isExpected: true,
            public: {
                code: 'RATE_LIMIT.TEMPORARY_BLOCK',
                message:
                    'Access from your current location has been blocked. If you believe this is an error, please contact support',
            },
        }),
        createErrorEntry({
            code: 'CSRF_TOKEN_INVALID',
            message: 'CSRF token is missing or invalid',
            statusCode: 403,
            isExpected: true,
            public: {
                code: 'AUTH.UNAUTHORIZED',
                message: 'Your session has expired. Please refresh the page and try again',
            },
        }),
        createErrorEntry({
            code: 'REQUEST_SIGNATURE_INVALID',
            message: 'Request signature validation failed',
            statusCode: 401,
            isExpected: true,
            public: {
                code: 'AUTH.UNAUTHORIZED',
                message: 'Request authentication failed',
            },
        }),
    ],

    // External service errors
    BETTER_AUTH: [
        createErrorEntry({
            code: 'DEFAULT',
            message: 'There was an error in the better-auth library',
            statusCode: 500,
            isExpected: true,
            public: 'AUTH.UNAUTHORIZED',
        }),
    ],
} as const;

/**
 * Define the error code type using the complex structure
 * These will be literal string types like 'AUTH.INVALID_TOKEN'
 */
export type TErrorFullCode = DotNotationFromNestedObjectArray<typeof ERROR_REGISTRY>;
export type TErrorCodeCategory = keyof typeof ERROR_REGISTRY;
export type TErrorShortCode = TErrorFullCode extends `${infer _}.${infer Name}` ? Name : never;
export type TErrorRegistry = typeof ERROR_REGISTRY;
