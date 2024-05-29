import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import type { InferRequestType } from 'hono/client';

const $get = client.api.transactions.$get;

type TGetTransactionsParams = InferRequestType<typeof $get>['query'];

export const useGetTransactions = (params?: TGetTransactionsParams) => {
    const query = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            const res = await client.api.transactions.$get({
                query: params || {}
            });

            if (!res.ok) throw new Error(res.statusText);

            return res.json();
        }
    });

    return query;
};
