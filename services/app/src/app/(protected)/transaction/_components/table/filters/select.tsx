import { transactionActions } from '@/actions';
import { SelectFilter } from '@/components/data-table/filters';
import { useFetch } from '@/hooks/action/useFetch';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useTransactionTableFilteringStore } from '../store';
import type { TTransactionFilterKeys } from './types';

interface Props {
    filterKey: TTransactionFilterKeys;
    filterLabel: string;
}

export const TransactionTableSelectFilter: React.FC<Props> = ({
    filterKey,
    filterLabel
}) => {
    const filters = useTransactionTableFilteringStore((state) => state.filters);
    const setFilter = useTransactionTableFilteringStore(
        (state) => state.setFilter
    );
    const selectedFilters = filters[filterKey] || [];

    const { data, refetch } = useQuery({
        queryKey: ['filterOptions', filterKey],
        queryFn: () => transactionActions.listFilterOptions({ filterKey }),
        enabled: false
    });

    // todo type narrowing
    if (!Array.isArray(selectedFilters)) {
        return null;
    }

    console.log({ data });

    // const options = [
    //     {
    //         label: 'Hotel',
    //         value: '83dde3c5-b108-44a3-8a7d-7612e7450d6a'
    //     }
    // ];

    return (
        <SelectFilter
            filterKey={filterKey}
            filterLabel={filterLabel}
            options={data?.success || []}
            selectedValues={selectedFilters}
            filterFn={setFilter}
            filterFetchFn={refetch}
        />
    );
};
