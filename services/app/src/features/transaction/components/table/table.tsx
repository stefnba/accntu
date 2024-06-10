'use client';

import { DataTable } from '@/components/ui/data-table';
import { storeTransactionTableRowSelection } from '@/features/transaction/store';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';

import { useGetTransactionFilterOptions } from '../../api/get-filter-options';
import { useGetTransactions } from '../../api/get-transactions';
import { columns } from './columns';
import { TransactionTableFooter } from './footer';
import { DataTableToolbar } from './toolbar';

interface Props {}

export const TransactionTable: React.FC<Props> = () => {
    const { transactions, isLoading } = useGetTransactions();

    /* Row selection */
    const rowSelection = storeTransactionTableRowSelection(
        (state) => state.rowSelection
    );
    const setRowSelection = storeTransactionTableRowSelection(
        (state) => state.setRowSelection
    );

    const { data } = useGetTransactionFilterOptions('spendingCurrency');

    /* Table */
    const table = useReactTable({
        data: transactions,
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
            <TransactionTableFooter />
        </div>
    );
};
