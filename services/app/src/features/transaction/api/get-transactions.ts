import {
    storeTransactionTableFiltering,
    storeTransactionTablePagination,
    storeTransactionTableSorting
} from '@/features/transaction/store';
import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { InferResponseType } from 'hono/client';
import { useMemo } from 'react';

const query = client.api.transactions.$get;

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
            const res = await query({
                query: {
                    page: page.toString(),
                    pageSize: pageSize.toString(),
                    ...filters,
                    ...filters,
                    startDate: filters.startDate
                        ? dayjs(filters.startDate).format('YYYY-MM-DD')
                        : undefined,
                    endDate: filters.endDate
                        ? dayjs(filters.endDate).format('YYYY-MM-DD')
                        : undefined
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
        count: useMemo(() => count || 0, [count])
    };
};
