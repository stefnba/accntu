'use client';

import { Table } from '@tanstack/react-table';

import { TransactionTableActionBar } from './actionbar';
import { TransactionTableFilterBar } from './filterbar';

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
