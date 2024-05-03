import { TTransactionOrderByObject } from '@/actions/transaction/schema';
import { DataTableColumnHeader } from '@/components/ui/data-table';

import { useTransactionTableSortingStore } from './store';

interface Props<TColKey extends TTransactionOrderByObject['column']>
    extends React.HTMLAttributes<HTMLDivElement> {
    columnKey: TColKey;
    title: string;
    showVisibility?: boolean;
    enableSorting?: boolean;
}

export function TransactionTableSortableColumnHeader<
    TColKey extends TTransactionOrderByObject['column']
>(props: Props<TColKey>) {
    // sorting
    const sorting = useTransactionTableSortingStore((state) => state.sorting);
    const setSorting = useTransactionTableSortingStore(
        (state) => state.setSorting
    );

    return (
        <DataTableColumnHeader
            sorting={{ currentSorting: sorting, sortingFn: setSorting }}
            {...props}
        />
    );
}
