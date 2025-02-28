import { UseMutationOptions } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';
import { StatusCode } from 'hono/utils/http-status';

import { useMutation } from '@tanstack/react-query';

/**
 * Creates a type-safe mutation hook for a Hono endpoint
 * @param endpoint - The Hono endpoint to create a mutation for
 * @param status - The status code of the response
 * @returns A type-safe mutation hook
 */
export function createMutation<
    TEndpoint extends (...args: any[]) => Promise<Response>,
    TStatus extends StatusCode = 201 | 204,
>(endpoint: TEndpoint) {
    type TParams = InferRequestType<typeof endpoint>;
    type TResponse = InferResponseType<typeof endpoint, TStatus>;

    return (options?: Omit<UseMutationOptions<TResponse, Error, TParams>, 'mutationFn'>) => {
        return useMutation<TResponse, Error, TParams>({
            mutationFn: async (variables) => {
                const response = await endpoint(variables);
                if (!response.ok) {
                    throw new Error(response.statusText || 'Request failed');
                }
                return response.json();
            },
            ...options,
        });
    };
}
