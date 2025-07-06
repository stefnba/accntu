import { useTransactionEndpoints } from '@/features/transaction/api';
import { createTransactionColumns } from '@/features/transaction/components/transaction-table/table-columns';
import { useTransactionFilters } from '@/features/transaction/hooks/transaction-filters';
import { useTransactionTablePagination } from '@/features/transaction/hooks/transaction-pagination';
import { useTransactionTableRowSelection } from '@/features/transaction/hooks/transaction-row-selection';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { parseAsString, useQueryState } from 'nuqs';

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

    // Get transaction data from API
    const { data } = useTransactionEndpoints.getAll({
        query: {
            page: '1',
            pageSize: '50',
            ...filtersUrl,
        },
    });

    const columns = createTransactionColumns();
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

        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
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
    };

    return {
        // pagination,
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

        // table
        table,

        // actions
        resetTableState,
    };
};
