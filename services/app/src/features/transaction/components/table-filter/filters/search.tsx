import { SearchFilter } from '@/components/data-table/filters/';
import { storeTransactionTableFiltering } from '@/features/transaction/store/table-filtering';

import { TTransactionFilterKeys } from './types';

interface Props {
    filterKey: Extract<TTransactionFilterKeys, 'title'>;
    filterLabel: string;
}

export const TransactionTableSearchFilter: React.FC<Props> = ({
    filterKey,
    filterLabel
}) => {
    const filters = storeTransactionTableFiltering((state) => state.filters);
    const setFilter = storeTransactionTableFiltering(
        (state) => state.setFilter
    );
    const resetFilterKey = storeTransactionTableFiltering(
        (state) => state.resetFilterKey
    );

    const value = filters[filterKey];

    return (
        <SearchFilter
            resetFilterKeyFn={resetFilterKey}
            filterKey={filterKey}
            filterFn={setFilter}
            value={value}
        />
    );
};
