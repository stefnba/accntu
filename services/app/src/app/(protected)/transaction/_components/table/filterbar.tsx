'use client';

import {
    FilterResetButton,
    SearchFilter
} from '@/components/data-table/filters';

import { TransactionTableSelectFilter } from './filters/select';
import { useTransactionTableFilteringStore } from './store';

interface Props {}

export function TransactionTableFilterBar({}: Props) {
    /* Filtering */
    const filters = useTransactionTableFilteringStore((state) => state.filters);
    const resetFilters = useTransactionTableFilteringStore(
        (state) => state.resetFilters
    );

    return (
        <div className="flex flex-1 items-center space-x-2">
            <TransactionTableSelectFilter
                filterKey="label"
                filterLabel="Label"
            />
            <TransactionTableSelectFilter
                filterKey="account"
                filterLabel="Account"
            />
            <TransactionTableSelectFilter
                filterKey="spendingCurrency"
                filterLabel="Spending Currency"
            />
            <TransactionTableSelectFilter
                filterKey="accountCurrency"
                filterLabel="Account Currency"
            />
            <FilterResetButton
                isFiltered={Object.keys(filters).length > 0}
                resetFiltersFn={resetFilters}
            />
        </div>
    );
}
