import { useTransactionEndpoints } from '@/features/transaction/api';
import { transactionColumns } from '@/features/transaction/components/transaction-table/table-columns';
import { useTransactionColumnState } from '@/features/transaction/hooks/column-management';
import { useTransactionFilters } from '@/features/transaction/hooks/transaction-filters';
import { useTransactionTablePagination } from '@/features/transaction/hooks/transaction-pagination';
import { useTransactionTableRowSelection } from '@/features/transaction/hooks/transaction-row-selection';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';

// ===================
// Parsers
// ===================

const parseAsSort = parseAsString.withDefault('date:desc');

// ===================
// Hooks
// ===================

const useTransactionTableSorting = () => {
    const [sorting, setSorting] = useQueryState('sort', parseAsSort);

    return {
        sorting,
        setSorting,
    };
};

/**
 * Main hook to manage transaction table state and configuration.
 * It consolidates various hooks and state management into a single hook.
 *
 */
export const useTransactionTable = () => {
    const { filtersUrl } = useTransactionFilters();

    const columns = useMemo(() => transactionColumns, [transactionColumns]);

    const {
        columnVisibility,
        onColumnVisibilityChange,
        columnOrder,
        onColumnOrderChange,
        reset: resetColumns,
    } = useTransactionColumnState();

    // Get transaction data from API
    const { data, isLoading } = useTransactionEndpoints.getAll({
        query: {
            page: '1',
            pageSize: '50',
            ...filtersUrl,
        },
    });

    const { pagination, setPagination } = useTransactionTablePagination();
    const { rowSelection, setRowSelection } = useTransactionTableRowSelection();
    const { sorting, setSorting } = useTransactionTableSorting();

    const table = useReactTable({
        data: data?.transactions || [],
        columns,
        getCoreRowModel: getCoreRowModel(),

        // we handle pagination, sorting, and filtering manually on the server side
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        pageCount: data?.totalCount || 0,

        onColumnVisibilityChange,
        onColumnOrderChange,
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
            columnVisibility,
            columnOrder,
        },

        enableRowSelection: true,
        enableColumnResizing: false,
        enableHiding: true, // We handle this manually
        enableSorting: true,
        getRowId: (row) => row.id,

        // debug
        debugTable: false,
        debugHeaders: false,
        debugColumns: false,
    });

    const resetTableState = () => {
        setPagination({ page: 0, pageSize: 50 });
        setSorting('date:desc');
        setRowSelection({});
        resetColumns();
    };

    return {
        pagination: {
            pagination,
            setPagination,
        },
        sorting: {
            sorting,
            setSorting,
        },
        rowSelection: {
            rowSelection,
            setRowSelection,
        },
        isLoading,
        table,
        resetTableState,
        resetColumns,
    };
};
