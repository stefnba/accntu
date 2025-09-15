import { TQueryKeyString } from '@/lib/api/types';
import { buildQueryKey } from '@/lib/api/utils';
import {
    InferBetterAuthParams,
    InferBetterFetchResponse,
    TBetterAuthApiFn,
} from '@/lib/auth/client/api-handlers/types';

import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';

export const createBetterAuthMutation = <
    TMutation extends TBetterAuthApiFn,
    TData extends InferBetterFetchResponse<TMutation>,
    TParams extends InferBetterAuthParams<TMutation>,
    TInitHooksReturn extends Record<string, unknown> = Record<string, unknown>,
>(
    mutation: TMutation,
    invalidateKeys?: TQueryKeyString,
    baseOptions?: Omit<
        UseMutationOptions<TData, Error, TParams>,
        'mutationFn' | 'onSuccess' | 'onError' | 'onSettled' | 'onMutate'
    > & {
        initHooks?: () => TInitHooksReturn;
        onSuccess?: (params: {
            data: TData;
            variables: TParams;
            context: unknown;
            hooks: TInitHooksReturn;
        }) => Promise<unknown> | unknown;
        onError?: (params: {
            error: Error;
            variables: TParams;
            context: unknown;
            hooks: TInitHooksReturn;
        }) => Promise<unknown> | unknown;
        onSettled?: (params: {
            data: TData | undefined;
            error: Error | null;
            variables: TParams;
            context: unknown;
            hooks: TInitHooksReturn;
        }) => Promise<unknown> | unknown;
        onMutate?: (params: {
            variables: TParams;
            hooks: TInitHooksReturn;
        }) => Promise<unknown> | unknown;
    }
) => {
    return (
        // options coming from inside the component implementing the mutation
        apiOptions?: Pick<
            UseMutationOptions<TData, Error, TParams>,
            'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
        >
    ) => {
        const queryClient = useQueryClient();

        // Use custom key extractor or default extraction logic

        const { initHooks, ...baseOptionsRest } = baseOptions || {};
        const { ...apiOptionsRest } = apiOptions || {};

        const initHooksResult = initHooks?.() || ({} as TInitHooksReturn); // should be safe to assume that initHooks will return a record of unknown

        return useMutation<TData, Error, TParams>({
            ...baseOptionsRest,
            ...apiOptionsRest,
            mutationFn: async (params) => {
                const result = await mutation(params);

                if (result.error) {
                    throw new Error(result.error.message);
                }

                return result.data;
            },
            onSuccess: (data, variables, context) => {
                if (invalidateKeys) {
                    const baseKeys = Array.isArray(invalidateKeys)
                        ? invalidateKeys
                        : [invalidateKeys];

                    // Invalidate each base key
                    baseKeys.forEach((key) => {
                        // For mutations, usually just invalidate the base key without mutation params
                        const queryKey = buildQueryKey({
                            defaultKey: key,
                            // Don't include mutation variables in query keys for invalidation
                        });

                        // TanStack Query will match prefixes automatically
                        queryClient.invalidateQueries({ queryKey });
                    });
                }

                // Call base options onSuccess if it exists
                if (baseOptions?.onSuccess) {
                    baseOptions.onSuccess({ data, variables, context, hooks: initHooksResult });
                }
                // Call api options onSuccess if it exists
                if (apiOptions?.onSuccess) {
                    apiOptions.onSuccess(data, variables, context);
                }
            },
            onError: (error, variables, context) => {
                // Call base options onError if it exists
                if (baseOptions?.onError) {
                    baseOptions.onError({ error, variables, context, hooks: initHooksResult });
                }
                // Call api options onError if it exists
                if (apiOptions?.onError) {
                    apiOptions.onError(error, variables, context);
                }
            },
            onSettled: (data, error, variables, context) => {
                // Call base options onSettled if it exists
                if (baseOptions?.onSettled) {
                    baseOptions.onSettled({
                        data,
                        error,
                        variables,
                        context,
                        hooks: initHooksResult,
                    });
                }
                // Call api options onSettled if it exists
                if (apiOptions?.onSettled) {
                    apiOptions.onSettled(data, error, variables, context);
                }
            },
            onMutate: (variables) => {
                // Call base options onMutate if it exists
                if (baseOptions?.onMutate) {
                    baseOptions.onMutate({ variables, hooks: initHooksResult });
                }
                // Call api options onMutate if it exists
                if (apiOptions?.onMutate) {
                    apiOptions.onMutate(variables);
                }
            },
        });
    };
};
