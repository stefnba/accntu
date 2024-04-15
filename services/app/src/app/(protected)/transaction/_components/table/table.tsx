'use client';

import { DataTable } from '@/components/ui/data-table';
import { Transaction } from '@prisma/client';
import {
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable
} from '@tanstack/react-table';

import { columns } from './columns';
import { TransactionTablePagination } from './pagination';
import {
    useTransactionTableFilteringStore,
    useTransactionTablePaginationStore
} from './store';
import { DataTableToolbar } from './toolbar';

interface Props {
    transactionData: Transaction[];
}

export const TransactionTable: React.FC<Props> = ({ transactionData }) => {
    /* Table */
    const table = useReactTable({
        data: transactionData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
        // onRowSelectionChange: setRowSelection,
        enableSorting: true,
        // getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        // state: {
        //     rowSelection
        // },
        getRowId: (row) => row.key,
        initialState: {
            sorting: [
                {
                    id: 'date',
                    desc: true
                },
                {
                    id: 'title',
                    desc: false
                }
            ]
        }
    });

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

    return (
        <div>
            <DataTableToolbar table={table} />
            <DataTable table={table} />
            <TransactionTablePagination
                table={table}
                pagination={{
                    page
                    // pageSize,
                    // handlePageSizeChange: (pageSize) => setPageSize(pageSize),
                    // handlePageChange: (page) => setPage(page)
                }}
            />
        </div>
    );
};
