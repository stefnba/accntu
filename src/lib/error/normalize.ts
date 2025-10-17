/**
 * API Error Normalization
 *
 * Converts any error into a standardized API error response format.
 * Used internally by createQuery and createMutation to ensure consistent error handling.
 */

import { APIErrorResponseSchema, TAPIErrorResponse } from '@/server/lib/error/api-response';

/**
 * Normalizes any error into a standardized API error response
 *
 * Attempts to parse the error as an API error response. If parsing fails,
 * wraps it in a default error structure for consistent handling.
 *
 * @param error - Any error object (API response, network error, etc.)
 * @returns Standardized API error response
 *
 * @example
 * ```typescript
 * // In createMutation/createQuery:
 * const errorObj = normalizeApiError(error);
 * return Promise.reject(errorObj);
 * ```
 */
export const normalizeApiError = (error: unknown): TAPIErrorResponse => {
    // Try to parse as our standardized error format
    const parsedResult = APIErrorResponseSchema.safeParse(error);

    if (parsedResult.success) {
        return parsedResult.data;
    }

    // Fallback: wrap unknown errors
    return {
        success: false,
        error: {
            message: 'An unknown error occurred',
            code: 'INTERNAL_ERROR',
            details: { originalError: error },
        },
        request_id: 'client-generated',
    };
};
