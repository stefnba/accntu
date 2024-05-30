import { DataTableColumnHeader } from '@/components/ui/data-table';
import { TTransactionOrderByObject } from '@/features/transaction/schema/table-sorting';
import { storeTransactionTableSorting } from '@/features/transaction/store';

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
    const sorting = storeTransactionTableSorting((state) => state.sorting);
    const setSorting = storeTransactionTableSorting(
        (state) => state.setSorting
    );

    return (
        <DataTableColumnHeader
            sorting={{ currentSorting: sorting, sortingFn: setSorting }}
            {...props}
        />
    );
}
