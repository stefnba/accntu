'use client';

import { TransactionTableFilterBar } from '@/features/transaction/components/table-filter/filterbar';
import { Table } from '@tanstack/react-table';

import { TransactionTableActionBar } from './actionbar';

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
}

export function DataTableToolbar<TData>({
    table
}: DataTableToolbarProps<TData>) {
    return (
        <div className="flex items-center justify-between">
            <TransactionTableFilterBar />
            <TransactionTableActionBar />
        </div>
    );
}
