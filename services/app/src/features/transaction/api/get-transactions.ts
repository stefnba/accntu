import {
    storeTransactionTableFiltering,
    storeTransactionTablePagination,
    storeTransactionTableRowSelection,
    storeTransactionTableSorting
} from '@/features/transaction/store';
import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';
import { useMemo } from 'react';

import { transaction } from './../../../server/db/schema';

const query = client.api.transactions.$get;

type TGetTransactionsParams = InferRequestType<typeof query>['query'];
export type TGetTransactionsResponse = InferResponseType<typeof query>;

export const useGetTransactions = () => {
    /* Pagination */
    const page = storeTransactionTablePagination((state) => state.page);
    const pageSize = storeTransactionTablePagination((state) => state.pageSize);

    /* Filtering */
    const filters = storeTransactionTableFiltering((state) => state.filters);

    /* Sorting */
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
                query: {
                    page: String(page),
                    pageSize: String(pageSize)
                }
            });

            if (!res.ok) throw new Error(res.statusText);

            return res.json();
        }
    });

    const { data, ...rest } = q;
    const { transactions, count } = data || {};

    return {
        ...rest,
        transactions: useMemo(
            () => (Array.isArray(transactions) ? transactions : []),
            [transactions]
        ),
        count: count || 0
    };
};
