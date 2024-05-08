import { SearchFilter } from '@/components/data-table/filters/';

import { useTransactionTableFilteringStore } from '../store';
import { TTransactionFilterKeys } from './types';

interface Props {
    filterKey: Extract<TTransactionFilterKeys, 'title'>;
    filterLabel: string;
}

export const TransactionTableSearchFilter: React.FC<Props> = ({
    filterKey,
    filterLabel
}) => {
    const filters = useTransactionTableFilteringStore((state) => state.filters);
    const setFilter = useTransactionTableFilteringStore(
        (state) => state.setFilter
    );
    const resetFilterKey = useTransactionTableFilteringStore(
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
