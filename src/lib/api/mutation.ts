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
    type TResponseError = InferResponseType<typeof endpoint, 400 | 500 | 404>;

    return (
        options?: Omit<UseMutationOptions<TResponse, TResponseError, TParams>, 'mutationFn'>
    ) => {
        const queryClient = useQueryClient();
        return useMutation<TResponse, TResponseError, TParams>({
            mutationFn: async (variables) => {
                const response = await endpoint(variables);

                if (!response.ok) {
                    return options?.onError?.(await response.json(), variables, undefined);
                }
                queryClient.invalidateQueries({ queryKey: queryKey });
                return response.json();
            },
            ...options,
        });
    };
}
