import { SelectFilter } from '@/components/data-table/filters';
import { useGetTransactionFilterOptions } from '@/features/transaction/api/get-filter-options';
import { storeTransactionTableFiltering } from '@/features/transaction/store/table-filtering';
import { useQuery } from '@tanstack/react-query';

import type { TTransactionFilterKeys } from './types';

interface Props {
    filterKey: TTransactionFilterKeys;
    filterLabel: string;
}

export const TransactionTableSelectFilter: React.FC<Props> = ({
    filterKey,
    filterLabel
}) => {
    const filters = storeTransactionTableFiltering((state) => state.filters);
    const resetFilterKey = storeTransactionTableFiltering(
        (state) => state.resetFilterKey
    );
    const setFilter = storeTransactionTableFiltering(
        (state) => state.setFilter
    );
    const selectedFilters = filters[filterKey] || [];

    const { data: filterOptions, refetch } =
        useGetTransactionFilterOptions(filterKey);

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
            resetFilterKeyFn={resetFilterKey}
        />
    );
};
