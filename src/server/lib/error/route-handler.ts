import { APIErrorResponse, createMutationResponse, errorFactory } from '@/server/lib/error';
import { BaseError } from '@/server/lib/error/base';
import { Context, TypedResponse } from 'hono';
import {
    ClientErrorStatusCode,
    ContentfulStatusCode,
    ServerErrorStatusCode,
    SuccessStatusCode,
} from 'hono/utils/http-status';
import { InvalidJSONValue, JSONParsed, JSONValue, SimplifyDeepArray } from 'hono/utils/types';
import { APIMutationResponse } from './types';

type ErrorReponseCode = ServerErrorStatusCode | ClientErrorStatusCode;
type SuccessResponseCode = SuccessStatusCode;

/**
 * Ensures the status code is a valid success status code
 * @param statusCode - The status code to ensure
 * @returns The status code if it is valid, otherwise 200
 */
export function ensureSuccessStatusCode(statusCode: ContentfulStatusCode): SuccessResponseCode {
    if (statusCode === 200) return 200;
    if (statusCode === 201) return 201;
    if (statusCode === 202) return 202;
    if (statusCode === 203) return 203;
    if (statusCode === 206) return 206;
    if (statusCode === 207) return 207;
    if (statusCode === 208) return 208;
    if (statusCode === 226) return 226;
    return 200;
}

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

type JSONRespondReturn<
    T extends JSONValue | SimplifyDeepArray<unknown> | InvalidJSONValue,
    U extends ContentfulStatusCode,
> = Response &
    TypedResponse<
        SimplifyDeepArray<T> extends JSONValue
            ? JSONValue extends SimplifyDeepArray<T>
                ? never
                : JSONParsed<T>
            : never,
        U,
        'json'
    >;

/**
 * Handles errors consistently across all route handlers
 *
 * @param c - The Hono context
 * @param error - The error to handle
 * @returns A typed error response
 */
function handleRouteError(
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

/**
 * Wraps a route handler with error handling
 *
 * Returns a typed response with the appropriate status code.
 * Maintains type safety for Hono RPC clients.
 *
 * @param c - The Hono context
 * @param handler - The async handler function that performs the operation
 * @param statusCode - Optional success status code (defaults to 200)
 * @returns A typed response with the result or an error response
 * @example
 * ```
 * app.get('/users', async (c) => {
 *   return withRoute(c, async () => {
 *     const users = await getUsers();
 *     return users;
 *   });
 * });
 * ```
 */
export async function withRoute<
    T extends JSONValue | SimplifyDeepArray<unknown> | InvalidJSONValue,
>(
    c: Context,
    handler: () => Promise<T>,
    statusCode: ContentfulStatusCode = 200
): Promise<
    | TypedResponse<T, SuccessResponseCode, 'json'>
    | TypedResponse<APIErrorResponse, ErrorReponseCode, 'json'>
> {
    try {
        const result = await handler();
        return c.json(result, statusCode) as TypedResponse<T, SuccessResponseCode, 'json'>;
    } catch (error: unknown) {
        return handleRouteError(c, error);
    }
}

/**
 * Wraps a query route handler with standardized response formatting
 *
 * Returns a typed response with the result for successful operations.
 * Always returns 200 status code for successful operations.
 *
 * @param c - The Hono context
 * @param handler - The async handler function that performs the query
 * @returns A typed response with the result or an error response
 * @example
 * ```
 * app.get('/users', async (c) => {
 *   return withQueryRoute(c, async () => {
 *     const users = await getUsers();
 *     return users;
 *   });
 * });
 * ```
 */
export async function withQueryRoute<
    T extends JSONValue | SimplifyDeepArray<unknown> | InvalidJSONValue,
>(
    c: Context,
    handler: () => Promise<T>
): Promise<
    TypedResponse<T, 200, 'json'> | TypedResponse<APIErrorResponse, ErrorReponseCode, 'json'>
> {
    try {
        const result = await handler();
        return c.json(result, 200) as TypedResponse<T, 200, 'json'>;
    } catch (error: unknown) {
        return handleRouteError(c, error);
    }
}

/**
 * Wraps a mutation route handler with standardized response formatting
 *
 * Returns a typed response with { success: true, data } for successful operations.
 * Returns 201 status code for created resources.
 *
 * @param c - The Hono context
 * @param handler - The async handler function that performs the mutation
 * @returns A typed response with standardized success or error format
 * @example
 * ```
 * app.post('/users', async (c) => {
 *   return withMutationRoute(c, async () => {
 *     const userData = await c.req.json();
 *     const user = await createUser(userData);
 *     return user;
 *   });
 * });
 * ```
 */
export async function withMutationRoute<
    T extends JSONValue | SimplifyDeepArray<unknown> | InvalidJSONValue,
>(
    c: Context,
    handler: () => Promise<T>
): Promise<
    | TypedResponse<APIMutationResponse<Awaited<T>>, 201, 'json'>
    | TypedResponse<APIErrorResponse, ErrorReponseCode, 'json'>
> {
    try {
        const result = await handler();
        return c.json(createMutationResponse(result), 201) as unknown as TypedResponse<
            APIMutationResponse<Awaited<T>>,
            201,
            'json'
        >;
    } catch (error: unknown) {
        return handleRouteError(c, error);
    }
}
