'use client';

import { DataTable } from '@/components/ui/data-table';
import {
    storeTransactionTablePagination,
    storeTransactionTableRowSelection
} from '@/features/transaction/store';
import {
    RowSelectionState,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { useGetTransactions } from '../../api/get-transactions';
import { columns } from './columns';
import { TransactionTablePagination } from './pagination';
import { DataTableToolbar } from './toolbar';

interface Props {}

export const TransactionTable: React.FC<Props> = () => {
    const { data, count, isLoading } = useGetTransactions();

    /* Row selection */
    const rowSelection = storeTransactionTableRowSelection(
        (state) => state.rowSelection
    );
    const setRowSelection = storeTransactionTableRowSelection(
        (state) => state.setRowSelection
    );

    /* Table */
    const table = useReactTable({
        data: useMemo(() => data, [data]),
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
            {/* <TransactionTablePagination
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
            /> */}
        </div>
    );
};
