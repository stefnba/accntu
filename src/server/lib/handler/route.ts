import { ErrorReponseCode, handleRouteError, SuccessResponseCode } from '@/server/lib/error/route';
import { Context, TypedResponse } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { InvalidJSONValue, JSONValue, SimplifyDeepArray } from 'hono/utils/types';
import { createMutationResponse, TAPIErrorResponse, TAPIMutationResponse } from '../error';

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
    | TypedResponse<TAPIErrorResponse, ErrorReponseCode, 'json'>
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
    TypedResponse<T, 200, 'json'> | TypedResponse<TAPIErrorResponse, ErrorReponseCode, 'json'>
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
    | TypedResponse<TAPIMutationResponse<Awaited<T>>, 201, 'json'>
    | TypedResponse<TAPIErrorResponse, ErrorReponseCode, 'json'>
> {
    try {
        const result = await handler();
        return c.json(createMutationResponse(result), 201) as unknown as TypedResponse<
            TAPIMutationResponse<Awaited<T>>,
            201,
            'json'
        >;
    } catch (error: unknown) {
        return handleRouteError(c, error);
    }
}
