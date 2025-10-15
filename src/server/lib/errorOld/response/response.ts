// src/server/error/response.ts
import { TAPIMutationResponse, TAPIResponse } from '@/server/lib/errorOld/response/types';
import { InvalidJSONValue, JSONValue, SimplifyDeepArray } from 'hono/utils/types';

/**
 * Creates a standardized success response for mutation endpoints
 *
 * This utility function ensures all success responses follow the same
 * structure with a success flag and data payload. It provides a consistent
 * API response format for clients.
 *
 * @param data - The data payload to include in the response
 * @returns A standardized success response object
 * @example
 * ```
 * return c.json(createMutationResponse({ user: userData }));
 * ```
 */
export function createMutationResponse<
    T extends JSONValue | SimplifyDeepArray<unknown> | InvalidJSONValue,
>(data: T): TAPIMutationResponse<T> {
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
 * if (isMutationResponse(response)) {
 *   // TypeScript knows response.data exists here
 *   processData(response.data);
 * }
 * ```
 */
export function isMutationResponse<
    T extends JSONValue | SimplifyDeepArray<unknown> | InvalidJSONValue,
>(response: TAPIResponse<T>): response is TAPIMutationResponse<T> {
    if (response === null || response === undefined) {
        return false;
    }
    if ('success' in response) {
        return response.success === true;
    }
    return false;
}
