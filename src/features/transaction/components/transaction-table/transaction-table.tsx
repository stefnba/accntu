'use client';

import {
    useTransactionFilters,
    useTransactionPeek,
    useTransactionTable,
} from '@/features/transaction/hooks';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useTransactionEndpoints } from '../../api';
import { TransactionBulkUpdateDrawer } from '../transaction-bulk-update';
import { TransactionTableFilters } from '../transaction-table-filters';
import { createTransactionColumns } from './table-columns';
import { TransactionDataTable } from './transaction-data-table';

export const TransactionTable = () => {
    const { filters } = useTransactionFilters();
    const { pagination, sorting, setPagination, setSorting } = useTransactionTable();
    const { isOpen, transactionId, openPeek, closePeek } = useTransactionPeek();

    // Row selection state for bulk operations
    const [rowSelection, setRowSelection] = useState({});
    const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);

    // Get filter options for editable cells
    const { data: filterOptions } = useTransactionEndpoints.getFilterOptions({});

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

    const { data } = useTransactionEndpoints.getAll({
        query: queryParams,
    });

    // Ensure we have valid data structure
    const transactions = data?.transactions || [];
    const totalPages = data?.pagination?.totalPages || 0;

    // Get selected transactions for bulk operations
    const selectedTransactions = useMemo(() => {
        return Object.keys(rowSelection)
            .filter((key) => rowSelection[key as keyof typeof rowSelection])
            .map((index) => transactions[parseInt(index)])
            .filter(Boolean);
    }, [rowSelection, transactions]);

    // Create columns with click handler and filter options
    const columns = useMemo(
        () =>
            createTransactionColumns(
                (transaction) => openPeek(transaction.id),
                { labels: filterOptions?.labels || [] },
                true // Enable selection
            ),
        [openPeek, filterOptions]
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
            rowSelection,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
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

            {/* Bulk actions bar */}
            {selectedTransactions.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">
                        {selectedTransactions.length} transactions selected
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsBulkUpdateOpen(true)}
                            className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                        >
                            Bulk Update
                        </button>
                        <button
                            onClick={() => setRowSelection({})}
                            className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80"
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>
            )}

            <TransactionDataTable table={table} />

            <TransactionBulkUpdateDrawer
                isOpen={isBulkUpdateOpen}
                onClose={() => {
                    setIsBulkUpdateOpen(false);
                    setRowSelection({}); // Clear selection after bulk update
                }}
                selectedTransactions={selectedTransactions}
                filterOptions={filterOptions}
            />
        </div>
    );
};
