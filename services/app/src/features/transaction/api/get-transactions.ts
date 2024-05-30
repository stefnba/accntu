import {
    storeTransactionTableFiltering,
    storeTransactionTablePagination,
    storeTransactionTableRowSelection,
    storeTransactionTableSorting
} from '@/features/transaction/store';
import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';

const query = client.api.transactions.$get;

type TGetTransactionsParams = InferRequestType<typeof query>['query'];
export type TGetTransactionsResponse = InferResponseType<typeof query>;

export const useGetTransactions = (params?: TGetTransactionsParams) => {
    /* Pagination */
    const page = storeTransactionTablePagination((state) => state.page);
    const pageSize = storeTransactionTablePagination((state) => state.pageSize);
    const setPage = storeTransactionTablePagination((state) => state.setPage);
    const setPageSize = storeTransactionTablePagination(
        (state) => state.setPageSize
    );

    /* Filtering */
    const filters = storeTransactionTableFiltering((state) => state.filters);

    /* Filtering */
    const sorting = storeTransactionTableSorting((state) => state.sorting);

    const q = useQuery({
        queryKey: [
            'transactions',
            { pageSize, page },
            { filters },
            { sorting }
        ],
        queryFn: async () => {
            const res = await client.api.transactions.$get({
                query: params || {}
            });

            if (!res.ok) throw new Error(res.statusText);

            return res.json();
        }
    });

    const { data, ...rest } = q;

    return {
        ...rest,
        data: data?.transactions || [],
        count: data?.count || 0
    };
};
