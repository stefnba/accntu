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
>(endpoint: TEndpoint, defaultQueryKey?: string | string[]) {
    type TParams = InferRequestType<typeof endpoint>;
    type TResponse = InferResponseType<typeof endpoint, TStatus>;

    return (
        params: TParams,
        options?: Omit<UseQueryOptions<TResponse, Error, TResponse>, 'queryKey' | 'queryFn'>
    ) => {
        const queryKey = Array.isArray(defaultQueryKey)
            ? [...defaultQueryKey, params]
            : [defaultQueryKey, params];

        return useQuery<TResponse, Error>({
            queryKey,
            queryFn: async () => {
                const response = await endpoint(params);
                if (!response.ok) {
                    throw new Error(response.statusText || 'Request failed');
                }
                return response.json();
            },
            ...options,
        });
    };
}
