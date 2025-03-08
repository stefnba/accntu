// src/server/error/types.ts

import { z } from 'zod';

/**
 * Enumeration of all possible error codes in the application
 *
 * These codes categorize errors by domain and type, making them
 * easier to handle systematically on both server and client.
 */
export type ErrorCode =
    // Auth Errors
    | 'AUTH.SESSION_NOT_FOUND' // Session not found
    | 'AUTH.SESSION_EXPIRED' // Session expired
    | 'AUTH.OTP_EXPIRED' // OTP expired
    | 'AUTH.OTP_ALREADY_USED' // OTP already used
    | 'AUTH.OTP_NOT_FOUND' // OTP not found
    | 'AUTH.OTP_INVALID' // OTP invalid
    | 'AUTH.OTP_GENERATION_FAILED' // OTP generation failed
    | 'AUTH.COOKIE_NOT_FOUND'
    | 'AUTH.COOKIE_INVALID'
    | 'AUTH.USER_NOT_FOUND'
    | 'AUTH.USER_NOT_IN_CONTEXT'
    | 'AUTH.EMAIL_EXISTS'
    | 'AUTH.INVALID_CREDENTIALS'
    | 'AUTH.TOO_MANY_INVALID_REQUESTS'
    // Validation Errors
    | 'VALIDATION.INVALID_INPUT'
    | 'VALIDATION.MISSING_FIELD'
    // Database Errors
    | 'DB.CONNECTION_ERROR'
    | 'DB.QUERY_FAILED'
    | 'DB.UNIQUE_VIOLATION'
    | 'DB.FOREIGN_KEY_VIOLATION'
    | 'DB.TRANSACTION_FAILED'
    | 'DB.INVALID_INPUT'
    | 'DB.INVALID_OUTPUT'
    | 'DB.QUERY_NULL_RETURNED'
    | 'DB.OPERATION_FAILED'
    // Rate Limiting Errors
    | 'RATE_LIMIT.TOO_MANY_REQUESTS'
    | 'RATE_LIMIT.IP_BLOCKED'
    // Service Errors
    | 'SERVICE.CREATE_FAILED'
    | 'SERVICE.UPDATE_FAILED'
    | 'SERVICE.DELETE_FAILED'
    | 'SERVICE.NOT_FOUND'
    | 'SERVICE.ALREADY_EXISTS'

    // Cookie Errors
    | 'COOKIE.INVALID_VALUE'

    // Generic Errors
    | 'INTERNAL_SERVER_ERROR';

/**
 * Application layers where errors can occur
 *
 * This helps track where in the application stack an error originated.
 */
export type ErrorLayer = 'query' | 'service' | 'route';

/**
 * Structure for an error in the error chain
 *
 * Each item in the chain represents an error as it propagates through
 * different layers of the application.
 */
export type ErrorChainItem = {
    layer: ErrorLayer;
    error: string;
    code: ErrorCode;
    timestamp: Date;
};

/**
 * Options for creating a BaseError
 *
 * These options provide additional context about the error.
 */
export type ErrorOptions = {
    cause?: Error;
    layer?: ErrorLayer;
    details?: Record<string, unknown>;
};

/**
 * Standard structure for API error responses
 *
 * This ensures all error responses follow the same format,
 * making client-side error handling more predictable.
 */
export type APIErrorResponse = {
    success: false;
    error: {
        code: ErrorCode;
        message: string;
        details?: Record<string, unknown>;
    };
    trace_id: string;
};

export const APIErrorResponseSchema = z.object({
    success: z.literal(false),
    error: z.object({
        code: z.custom<ErrorCode>(),
        message: z.string(),
        details: z.record(z.unknown()).optional(),
    }),
    trace_id: z.string(),
});
export type APIErrorResponseA = z.infer<typeof APIErrorResponseSchema>;

/**
 * Standard structure for succesful API mutation responses
 *
 * This ensures all success responses follow the same format.
 */
export type APIMutationResponse<T> = {
    success: true;
    data: T;
};

/**
 * Union type for all possible API responses
 *
 * This allows for type-safe handling of both success and error responses.
 */
export type APIResponse<T> = APIMutationResponse<T> | APIErrorResponse;
