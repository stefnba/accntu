import { TransactionFilterKeysSchema } from '@/features/transaction/schema/table-filtering';
import { storeTransactionTableFiltering } from '@/features/transaction/store';
import { client } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { z } from 'zod';

const query = client.api.transactions.filters[':filterKey'].$get;

export const useGetTransactionFilterOptions = (
    filterKey: z.infer<typeof TransactionFilterKeysSchema>
) => {
    const filters = storeTransactionTableFiltering((state) => state.filters);

    const q = useQuery({
        queryKey: ['transaction-filter-options', { filterKey }, { filters }],
        queryFn: async () => {
            const res = await query({
                param: {
                    filterKey
                },
                query: {
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

    return q;
};
