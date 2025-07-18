'use client';

import { ErrorHandler, handleErrorHandlers, normalizeApiError } from '@/lib/error';
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';
import { StatusCode } from 'hono/utils/http-status';
import { extractQueryKeyParams } from './utils';

/**
 * Creates a type-safe mutation hook for a Hono endpoint
 * @param endpoint - The Hono endpoint to create a mutation for
 * @param baseQueryKey - Base query key to invalidate (params will be auto-extracted and appended)
 * @returns A type-safe mutation hook
 */
export function createMutation<
    TEndpoint extends (...args: any[]) => Promise<Response>,
    TStatus extends StatusCode = 201 | 204,
>(endpoint: TEndpoint, baseQueryKey?: string | readonly string[]) {
    type TParams = InferRequestType<typeof endpoint>;
    type TResponse = InferResponseType<typeof endpoint, TStatus>;
    type TResponseError = InferResponseType<
        typeof endpoint,
        400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 502
    >;

    return (
        options?: Omit<UseMutationOptions<TResponse, TResponseError, TParams>, 'mutationFn'> & {
            errorHandlers?: ErrorHandler;
        }
    ) => {
        const queryClient = useQueryClient();

        // Extract errorHandlers from options
        const { errorHandlers, ...mutationOptions } = options || {};

        // Create a custom onError function that uses the error handlers
        const originalOnError = mutationOptions.onError;

        const enhancedOptions = {
            ...mutationOptions,
            onError:
                errorHandlers || originalOnError
                    ? (error: TResponseError, variables: TParams, context: unknown) => {
                          handleErrorHandlers(error, errorHandlers);

                          // Also call the original onError if it exists
                          if (originalOnError) {
                              originalOnError(error, variables, context);
                          }
                      }
                    : undefined,
        };

        return useMutation<TResponse, TResponseError, TParams>({
            mutationFn: async (variables) => {
                try {
                    const response = await endpoint(variables);

                    if (!response.ok) {
                        // Handle 401 redirects at the component level instead
                        // to allow for more graceful handling

                        // Handle API error responses
                        const errorData = await response.json();
                        const errorObj = normalizeApiError(errorData);
                        return Promise.reject(errorObj);
                    }

                    // Handle empty responses (like 204 No Content)
                    if (response.status === 204) {
                        return {} as TResponse;
                    }

                    const data = await response.json();

                    // Smart invalidation using parameter extraction
                    if (baseQueryKey) {
                        const baseKey = Array.isArray(baseQueryKey) ? baseQueryKey : [baseQueryKey];

                        // Extract parameters from mutation variables
                        const extractedParams = extractQueryKeyParams(variables);

                        // Always invalidate the base query (for lists)
                        queryClient.invalidateQueries({ queryKey: baseKey });

                        // If there are extracted parameters, also invalidate the specific resource
                        if (extractedParams.length > 0) {
                            const specificQueryKey = [...baseKey, ...extractedParams];
                            queryClient.invalidateQueries({ queryKey: specificQueryKey });
                        }
                    }

                    return data;
                } catch (error) {
                    console.error('Mutation error:', error);

                    // Handle API error responses
                    const errorObj = normalizeApiError(error);
                    return Promise.reject(errorObj);
                }
            },
            ...enhancedOptions,
        });
    };
}
