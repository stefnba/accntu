'use client';

import { DataTable } from '@/components/data-table';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTransactionEndpoints } from '../api';
import { useTransactionTableStore } from '../store';
import { transactionColumns } from './transaction-columns';
import { TransactionTableFilters } from './transaction-filters';

export const TransactionTable = () => {
    const { filters, pagination, sorting } = useTransactionTableStore();

    // Build query parameters
    const queryParams = useMemo(
        () => ({
            page: pagination.pageIndex + 1,
            pageSize: pagination.pageSize,
            search: filters.search || undefined,
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
            accountIds: filters.accountIds?.length ? filters.accountIds : undefined,
            labelIds: filters.labelIds?.length ? filters.labelIds : undefined,
            tagIds: filters.tagIds?.length ? filters.tagIds : undefined,
            type: filters.type?.length ? filters.type : undefined,
            currencies: filters.currencies?.length ? filters.currencies : undefined,
        }),
        [filters, pagination]
    );

    // TODO: Uncomment when API client is working
    const transactions = useTransactionEndpoints.getAll({
        query: {},
    });

    // Ensure we have valid data structure
    const transactions = (data?.transactions || []) as any[];
    const totalPages = data?.pagination?.totalPages || 0;

    const table = useReactTable({
        data: transactions,
        columns: transactionColumns,
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

    if (error) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <p className="text-destructive">Failed to load transactions</p>
                    <p className="text-sm text-muted-foreground mt-1">{error.error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <TransactionTableFilters />
            <DataTable data={transactions as any} />
        </div>
    );
};
