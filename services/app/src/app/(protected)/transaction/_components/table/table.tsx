'use client';

import { transactionActions } from '@/actions';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useQuery } from '@tanstack/react-query';
import {
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { columns } from './columns';
import { TransactionTablePagination } from './pagination';
import {
    useTransactionTableFilteringStore,
    useTransactionTablePaginationStore
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

    console.log('filters', filters);

    /* Query */
    const { data: transactionResponse } = useQuery({
        queryKey: ['transactions', { pageSize, page }, { filters }],
        queryFn: () => transactionActions.list({ pageSize, page, ...filters })
    });

    const transactionData = transactionResponse?.success?.transactions;
    const transactionCount = transactionResponse?.success?.count;

    /* Table */
    const table = useReactTable({
        data: useMemo(() => transactionData ?? [], [transactionData]),
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
        // onRowSelectionChange: setRowSelection,
        enableSorting: true,
        getRowId: (row) => row.id
    });

    return (
        <div>
            <DataTableToolbar table={table} />
            <DataTable table={table} />
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
