'use client';

import { FilterResetButton } from '@/components/data-table/filters';
import { storeTransactionTableFiltering } from '@/features/transaction/store/table-filtering';

import { TransactionTableDateFilter } from './filters/date';
import { TransactionTableSearchFilter } from './filters/search';
import { TransactionTableSelectFilter } from './filters/select';

interface Props {}

export function TransactionTableFilterBar({}: Props) {
    /* Filtering */
    const filters = storeTransactionTableFiltering((state) => state.filters);
    const resetFilters = storeTransactionTableFiltering(
        (state) => state.resetFilters
    );

    return (
        <div className="flex flex-1 items-center space-x-2">
            <TransactionTableSearchFilter
                filterKey="title"
                filterLabel="Title"
            />
            <TransactionTableDateFilter
                periodEndfilterKey="endDate"
                periodStartfilterKey="startDate"
                filterLabel="Date"
            />
            <TransactionTableSelectFilter
                filterKey="label"
                filterLabel="Label"
            />
            <TransactionTableSelectFilter filterKey="tag" filterLabel="Tag" />
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
            <TransactionTableSelectFilter filterKey="type" filterLabel="Type" />
            <FilterResetButton
                isFiltered={Object.keys(filters).length > 0}
                resetFiltersFn={resetFilters}
            />
        </div>
    );
}
