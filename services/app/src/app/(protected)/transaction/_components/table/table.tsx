'use client';

import { transactionActions } from '@/actions';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useQuery } from '@tanstack/react-query';
import {
    RowSelectionState,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { columns } from './columns';
import { TransactionTablePagination } from './pagination';
import {
    useTransactionTableFilteringStore,
    useTransactionTablePaginationStore,
    useTransactionTableRowSelectionStore,
    useTransactionTableSortingStore
} from './store';
import { DataTableToolbar } from './toolbar';

interface Props {}

export const TransactionTable: React.FC<Props> = () => {
    /* Pagination */
    const page = useTransactionTablePaginationStore((state) => state.page);
    const pageSize = useTransactionTablePaginationStore(
        (state) => state.pageSize
    );
    const setPage = useTransactionTablePaginationStore(
        (state) => state.setPage
    );
    const setPageSize = useTransactionTablePaginationStore(
        (state) => state.setPageSize
    );

    /* Filtering */
    const filters = useTransactionTableFilteringStore((state) => state.filters);

    /* Filtering */
    const sorting = useTransactionTableSortingStore((state) => state.sorting);

    /* Row selection */
    const rowSelection = useTransactionTableRowSelectionStore(
        (state) => state.rowSelection
    );
    const setRowSelection = useTransactionTableRowSelectionStore(
        (state) => state.setRowSelection
    );
    // const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    /* Query */
    const { data: transactionResponse, isLoading } = useQuery({
        queryKey: [
            'transactions',
            { pageSize, page },
            { filters },
            { sorting }
        ],
        queryFn: () =>
            transactionActions.list({
                pageSize,
                page,
                ...filters,
                orderBy: sorting
            })
    });

    const transactionData = transactionResponse?.transactions;
    const transactionCount = transactionResponse?.count;

    /* Table */
    const table = useReactTable({
        data: useMemo(() => transactionData ?? [], [transactionData]),
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        enableSorting: true,
        getRowId: (row) => row.id,
        state: {
            rowSelection
        }
    });

    return (
        <div>
            <DataTableToolbar table={table} />
            <DataTable isLoading={isLoading} table={table} />
            <TransactionTablePagination
                table={table}
                records={{
                    total: transactionCount
                }}
                pagination={{
                    page,
                    pageSize,
                    handlePageSizeChange: (pageSize) => setPageSize(pageSize),
                    handlePageChange: (page) => setPage(page)
                }}
            />
        </div>
    );
};
