import { isSuccessResponse } from '@/lib/error';
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';
import { StatusCode } from 'hono/utils/http-status';

/**
 * Creates a type-safe mutation hook for a Hono endpoint
 * @param endpoint - The Hono endpoint to create a mutation for
 * @param status - The status code of the response
 * @returns A type-safe mutation hook
 */
export function createMutation<
    TEndpoint extends (...args: any[]) => Promise<Response>,
    TStatus extends StatusCode = 201 | 204,
>(endpoint: TEndpoint, queryKey?: string | string[]) {
    type TParams = InferRequestType<typeof endpoint>;
    type TResponse = InferResponseType<typeof endpoint, TStatus>;
    type TResponseError = InferResponseType<
        typeof endpoint,
        400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 502
    >;

    return (
        options?: Omit<UseMutationOptions<TResponse, TResponseError, TParams>, 'mutationFn'>
    ) => {
        const queryClient = useQueryClient();
        return useMutation<TResponse, TResponseError, TParams>({
            mutationFn: async (variables) => {
                try {
                    const response = await endpoint(variables);

                    if (!response.ok) {
                        // If the response is 401, redirect to the login page
                        if (response.status === 401) {
                            window.location.href = '/login';
                        }

                        const errorData = await response.json();
                        // Check if it's our standardized error format
                        if (errorData && !isSuccessResponse(errorData)) {
                            return Promise.reject(errorData);
                        }
                        // For non-standard errors
                        return Promise.reject({
                            error: {
                                message: response.statusText || 'Request failed',
                                code: 'UNKNOWN_ERROR',
                                statusCode: response.status,
                            },
                        });
                    }

                    // Handle empty responses (like 204 No Content)
                    if (response.status === 204) {
                        return {} as TResponse;
                    }

                    const data = await response.json();

                    // Invalidate related queries if a queryKey was provided
                    if (queryKey) {
                        queryClient.invalidateQueries({ queryKey: queryKey });
                    }

                    return data;
                } catch (error) {
                    console.error('Mutation error:', error);
                    return Promise.reject(error);
                }
            },
            ...options,
        });
    };
}
