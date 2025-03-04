/**
 * Route Error Handling
 *
 * This module provides utilities for handling errors in route handlers and
 * transforming them into structured API responses with appropriate status codes.
 * It includes special handling for Hono RPC type safety.
 */

import { Context, TypedResponse } from 'hono';
import {
    ClientErrorStatusCode,
    ContentfulStatusCode,
    ServerErrorStatusCode,
    SuccessStatusCode,
} from 'hono/utils/http-status';
import { BaseError } from './base';
import { errorFactory } from './factory';
import { APIErrorResponse } from './types';

export type ErrorReponseCode = ServerErrorStatusCode | ClientErrorStatusCode;
export type SuccessResponseCode = SuccessStatusCode;

/**
 * Type narrowing function to ensure we only return error status codes
 * This helps with RPC type inference by ensuring success and error types don't overlap
 */
export function ensureErrorStatusCode(statusCode: ContentfulStatusCode): ErrorReponseCode {
    if (statusCode === 400) return 400;
    if (statusCode === 401) return 401;
    if (statusCode === 403) return 403;
    if (statusCode === 404) return 404;
    if (statusCode === 409) return 409;
    if (statusCode === 422) return 422;
    if (statusCode === 429) return 429;
    if (statusCode === 502) return 502;
    return 500; // Default to 500 for any other status code
}

/**
 * Handles errors consistently across all route handlers
 *
 * This function processes errors and transforms them into standardized API responses.
 * It includes special conditional blocks that are critical for Hono RPC type safety.
 * These blocks are never executed at runtime but provide necessary type information
 * for the RPC client to properly infer error response types.
 *
 * @param c - The Hono context
 * @param error - The error to handle
 * @returns A typed error response
 */
export function handleRouteError(
    c: Context,
    error: unknown
): TypedResponse<APIErrorResponse, ErrorReponseCode, 'json'> {
    // Handle BaseError with proper type narrowing for RPC
    if (error instanceof BaseError) {
        const errorStatusCode = ensureErrorStatusCode(error.statusCode || 500);

        // IMPORTANT: This conditional block is required for Hono RPC type safety
        // It's never executed at runtime, but provides necessary type information
        // for the RPC client to properly infer error response types
        if (false as boolean) {
            return c.json(error.toResponse(), errorStatusCode);
        }

        // re-throw the error to be handled by the global error handler
        throw error;
    }

    // For unknown errors, create a generic error response

    // IMPORTANT: This conditional block is required for Hono RPC type safety
    // It's never executed at runtime, but provides necessary type information
    // for the RPC client to properly infer error response types
    if (false as boolean) {
        return c.json(
            errorFactory
                .createError({
                    message: 'An unexpected error occurred',
                    code: 'INTERNAL_SERVER_ERROR',
                    statusCode: 500,
                })
                .toResponse(),
            500
        );
    }

    // re-throw the error to be handled by the global error handler
    throw error;
}
