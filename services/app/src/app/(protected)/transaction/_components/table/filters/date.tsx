import { DateFilter } from '@/components/data-table/filters/date/';
import dayjs from 'dayjs';

import { useTransactionTableFilteringStore } from '../store';
import type { TTransactionFilterKeys } from './types';

interface Props {
    filterKey: Extract<TTransactionFilterKeys, 'date'>;
    filterLabel: string;
}

const PERIOD_OPTIONS = [
    {
        value: 'CURRENT_MONTH',
        label: `This Month (${dayjs().format('MMM')})`
    },
    {
        value: 'CURRENT_YEAR',
        label: `This Year (${new Date().getFullYear()})`
    },
    {
        value: 'PREVIOUS_YEAR',
        label: `Last Year (${new Date().getFullYear() - 1})`
    },
    {
        value: 'PREVIOUS_MONTH',
        label: `Last Month (${dayjs().subtract(1, 'M').format('MMM')})`
    }
];

export const TransactionTableDateFilter: React.FC<Props> = ({
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

    const selectedDate = filters[filterKey];

    return (
        <DateFilter
            periodOptions={PERIOD_OPTIONS}
            filteredValue={selectedDate}
            filterKey={filterKey}
            filterLabel={filterLabel}
            filterFn={setFilter}
            resetFilterKeyFn={resetFilterKey}
        />
    );
};
