import { transactionActions } from '@/actions';
import { SelectFilter } from '@/components/data-table/filters';
import { useQuery } from '@tanstack/react-query';

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

    const { data: filterOptions, refetch } = useQuery({
        queryKey: ['filterOptions', filterKey],
        queryFn: () => transactionActions.listFilterOptions({ filterKey }),
        enabled: false
    });

    // todo type narrowing
    if (!Array.isArray(selectedFilters)) {
        return null;
    }

    return (
        <SelectFilter
            filterKey={filterKey}
            filterLabel={filterLabel}
            options={filterOptions}
            selectedValues={selectedFilters}
            filterFn={setFilter}
            filterFetchFn={refetch}
        />
    );
};
