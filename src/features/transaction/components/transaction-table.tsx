'use client';

import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTransactionEndpoints } from '../api';
import { useTransactionPeek } from '../hooks';
import { useTransactionTableStore } from '../store';
import { createTransactionColumns, TransactionWithRelations } from './transaction-columns';
import { TransactionDataTable } from './transaction-data-table';
import { TransactionTableFilters } from './transaction-filters';
import { TransactionPeekSheet } from './transaction-peek-sheet';

export const TransactionTable = () => {
    const { filters, pagination, sorting } = useTransactionTableStore();
    const { isOpen, transactionId, openPeek, closePeek } = useTransactionPeek();

    // Build query parameters
    const queryParams = useMemo(
        () => ({
            page: pagination.pageIndex + 1,
            pageSize: pagination.pageSize,
            search: filters.search || undefined,
            startDate: filters.startDate?.toISOString() || undefined,
            endDate: filters.endDate?.toISOString() || undefined,
            accountIds: filters.accountIds?.length ? filters.accountIds : undefined,
            labelIds: filters.labelIds?.length ? filters.labelIds : undefined,
            tagIds: filters.tagIds?.length ? filters.tagIds : undefined,
            type: filters.type?.length ? filters.type : undefined,
            currencies: filters.currencies?.length ? filters.currencies : undefined,
        }),
        [filters, pagination]
    );

    const { data, error, isLoading } = useTransactionEndpoints.getAll({
        query: queryParams,
    });

    // Ensure we have valid data structure
    const transactions = (data?.transactions || []) as TransactionWithRelations[];
    const totalPages = data?.pagination?.totalPages || 0;

    // Create columns with click handler
    const columns = useMemo(
        () => createTransactionColumns((transaction) => openPeek(transaction.id)),
        [openPeek]
    );

    const table = useReactTable({
        data: transactions,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        pageCount: totalPages,
        state: {
            pagination,
            sorting,
        },
        onPaginationChange: useTransactionTableStore.getState().setPagination,
        onSortingChange: useTransactionTableStore.getState().setSorting,
    });

    // if (error) {
    //     return (
    //         <div className="flex items-center justify-center p-8">
    //             <div className="text-center">
    //                 <p className="text-destructive">Failed to load transactions</p>
    //                 <p className="text-sm text-muted-foreground mt-1">{error.error.message}</p>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="space-y-4">
            <TransactionTableFilters />
            <TransactionDataTable table={table} />
            <TransactionPeekSheet
                transactionId={transactionId}
                isOpen={isOpen}
                onClose={closePeek}
            />
        </div>
    );
};
