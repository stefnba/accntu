import { TQueryKeyString } from '@/lib/api/types';
import { buildQueryKey } from '@/lib/api/utils';
import {
    InferBetterAuthParams,
    InferBetterFetchResponse,
    TBetterAuthApiFn,
} from '@/lib/auth/client/api-handlers/types';
import { useSession } from '@/lib/auth/client/hooks';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const createBetterAuthQuery = <
    TQuery extends TBetterAuthApiFn,
    TData extends InferBetterFetchResponse<TQuery>,
    TParams extends InferBetterAuthParams<TQuery>,
    TInitHooksReturn extends Record<string, unknown> = Record<string, unknown>,
>(
    query: TQuery,
    queryKeys?: TQueryKeyString,
    baseOptions?: Omit<UseQueryOptions<TData, Error, TParams>, 'queryFn'> & {
        initHooks?: () => TInitHooksReturn;
    }
) => {
    return (params?: TParams) => {
        const { initHooks, enabled, ...baseOptionsRest } = baseOptions || {};
        const { isAuthenticated } = useSession();

        // Use custom key extractor or default extraction logic
        const queryKey = buildQueryKey({ defaultKey: queryKeys });

        const initHooksResult = initHooks?.() || ({} as TInitHooksReturn); // should be safe to assume that initHooks will return a record of unknown

        return useQuery<TData, Error>({
            ...baseOptionsRest,

            queryKey,
            enabled: enabled || isAuthenticated,
            queryFn: async () => {
                const result = await query(params || {});

                console.log('result', result);

                if (result.error) {
                    throw new Error(result.error.message || `${result.error.statusText}`);
                }

                return result.data;
            },
        });
    };
};
