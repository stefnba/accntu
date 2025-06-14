'use client';

import { ErrorHandler, handleErrorHandlers, normalizeApiError } from '@/lib/error';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';
import { StatusCode } from 'hono/utils/http-status';

/**
 * Creates a type-safe query hook for a Hono endpoint
 * @param endpoint - The Hono endpoint to create a query for
 * @param defaultQueryKey - The default query key
 * @returns A type-safe query hook
 */
export function createQuery<
    TEndpoint extends (...args: any[]) => Promise<Response>,
    TStatus extends StatusCode = 200,
>(endpoint: TEndpoint, defaultQueryKey?: string | readonly (string | undefined)[]) {
    type TParams = InferRequestType<typeof endpoint>;
    type TResponse = InferResponseType<typeof endpoint, TStatus>;
    type TResponseError = InferResponseType<
        typeof endpoint,
        400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 502
    >;

    return (
        params: TParams,
        options?: Omit<
            UseQueryOptions<TResponse, TResponseError, TResponse>,
            'queryKey' | 'queryFn'
        > & {
            errorHandlers?: ErrorHandler;
        }
    ) => {
        const queryKey = Array.isArray(defaultQueryKey)
            ? [...defaultQueryKey, params]
            : [defaultQueryKey, params];

        // Extract errorHandlers from options
        const { errorHandlers, ...queryOptions } = options || {};

        const enhancedOptions: Omit<
            UseQueryOptions<TResponse, TResponseError, TResponse>,
            'queryKey' | 'queryFn'
        > = {
            ...queryOptions,
        };

        return useQuery<TResponse, TResponseError>({
            queryKey,
            queryFn: async () => {
                try {
                    const response = await endpoint(params);

                    if (!response.ok) {
                        if (response.status === 401) {
                            window.location.href = '/login';
                        }

                        const errorData = await response.json();
                        // Check if it's our standardized error format
                        const errorObj = normalizeApiError(errorData);

                        // Handle error handlers
                        handleErrorHandlers(errorObj, errorHandlers);

                        return Promise.reject(errorObj);
                    }

                    // Handle empty responses (like 204 No Content)
                    if (response.status === 204) {
                        return {} as TResponse;
                    }

                    return response.json();
                } catch (error) {
                    console.error('Query error:', error);

                    // Handle API error responses
                    const errorObj = normalizeApiError(error);
                    return Promise.reject(errorObj);
                }
            },
            ...enhancedOptions,
        });
    };
}
