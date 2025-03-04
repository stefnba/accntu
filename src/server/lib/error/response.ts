// src/server/error/response.ts
import { BaseError } from '@/server/lib/error';
import { Context } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { APIResponse, APISuccessResponse } from './types';

/**
 * Creates a standardized success response
 *
 * This utility function ensures all success responses follow the same
 * structure with a success flag and data payload. It provides a consistent
 * API response format for clients.
 *
 * @param data - The data payload to include in the response
 * @returns A standardized success response object
 * @example
 * ```
 * return c.json(createSuccessResponse({ user: userData }));
 * ```
 */
export function createSuccessResponse<T>(data: T): APISuccessResponse<T> {
    return {
        success: true,
        data,
    };
}

/**
 * Type guard to check if a response is a success response
 *
 * This function provides type narrowing for TypeScript, allowing you
 * to safely access the data property of a success response after checking.
 *
 * @param response - The API response to check
 * @returns True if the response is a success response, false otherwise
 * @example
 * ```
 * if (isSuccessResponse(response)) {
 *   // TypeScript knows response.data exists here
 *   processData(response.data);
 * }
 * ```
 */
export function isSuccessResponse<T>(response: APIResponse<T>): response is APISuccessResponse<T> {
    return response.success === true;
}

/**
 * Returns a JSON success response
 * @param c The Hono context
 * @param data The data to include in the response
 * @param status The HTTP status code
 * @returns A JSON response
 */
export function jsonSuccessResponse<T>(c: Context, data: T, status: ContentfulStatusCode = 201) {
    return c.json(createSuccessResponse(data), status);
}

/**
 * Returns a JSON error response
 * @param c The Hono context
 * @param error The error to include in the response
 * @param status The HTTP status code
 */
export function jsonErrorResponse<T>(
    c: Context,
    error: BaseError,
    status: ContentfulStatusCode = 500
) {
    return c.json(error.toResponse(), status);

    // throw new HTTPException(status, {
    //     message: 'An unexpected error occurred',
    // });
}

// export function createErrorResponse<T>(error: BaseError): APIErrorResponse<T> {
//     return {
//         success: false,
//         error: error.toResponse(),
//     };
// }
