import {
    DateFilter,
    type TDateFilterPeriodOptions
} from '@/components/data-table/filters/date/';
import { storeTransactionTableFiltering } from '@/features/transaction/store/table-filtering';
import dayjs from 'dayjs';

import type { TTransactionFilterKeys } from './types';

interface Props {
    periodStartfilterKey: Extract<TTransactionFilterKeys, 'startDate'>;
    periodEndfilterKey: Extract<TTransactionFilterKeys, 'endDate'>;
    filterLabel: string;
}

const PERIOD_OPTIONS: TDateFilterPeriodOptions = [
    {
        value: 'CURRENT_MONTH',
        label: `Current Month (${dayjs().format('MMM')})`,
        startDate: dayjs().startOf('month').toDate(),
        endDate: dayjs().endOf('month').toDate()
    },
    {
        value: 'PREVIOUS_MONTH',
        label: `Last Month (${dayjs().subtract(1, 'M').format('MMM')})`,
        startDate: dayjs().subtract(1, 'M').startOf('month').toDate(),
        endDate: dayjs().subtract(1, 'M').endOf('month').toDate()
    },
    {
        value: 'CURRENT_YEAR',
        label: `Current Year (${new Date().getFullYear()})`,
        startDate: dayjs().startOf('year').toDate(),
        endDate: dayjs().endOf('year').toDate()
    },
    {
        value: 'PREVIOUS_YEAR',
        label: `Last Year (${new Date().getFullYear() - 1})`,
        startDate: dayjs().subtract(1, 'y').startOf('year').toDate(),
        endDate: dayjs().subtract(1, 'y').endOf('year').toDate()
    }
];

export const TransactionTableDateFilter: React.FC<Props> = ({
    periodStartfilterKey,
    periodEndfilterKey,
    filterLabel
}) => {
    const filters = storeTransactionTableFiltering((state) => state.filters);
    const setFilter = storeTransactionTableFiltering(
        (state) => state.setFilter
    );
    const resetFilterKey = storeTransactionTableFiltering(
        (state) => state.resetFilterKey
    );

    const selectedRange: [Date | undefined, Date | undefined] = [
        filters.startDate,
        filters.endDate
    ];

    return (
        <DateFilter
            periodOptions={PERIOD_OPTIONS}
            filteredValue={selectedRange}
            periodEndfilterKey="endDate"
            periodStartfilterKey="startDate"
            filterLabel={filterLabel}
            filterFn={setFilter}
            resetFilterKeyFn={resetFilterKey}
        />
    );
};
