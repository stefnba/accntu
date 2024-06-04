import { DataTable, DataTablePagination } from '@/components/ui/data-table';
import { usePreviewTransactions } from '@/features/import/api/preview-transactions';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';
import { storePreviewImportFiles } from '@/features/import/store/preview-import-files';
import type { TParsedTransaction } from '@/features/import/types/preview-transactions';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable
} from '@tanstack/react-table';
import { useMemo } from 'react';

import { columns } from './preview-table-columns';

interface Props {}

/**
 * Display transactions
 */
export const CreateImportPreviewTable: React.FC<Props> = ({}) => {
    const { importId } = storeCreateImportModal();
    const { fileId } = storePreviewImportFiles();

    const { data } = usePreviewTransactions({
        id: importId,
        fileId
    });

    const table = useReactTable({
        data: useMemo(() => data ?? [], [data]),
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
        // onRowSelectionChange: setRowSelection,
        enableSorting: true,
        getSortedRowModel: getSortedRowModel(),
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
    return (
        <div>
            <DataTable table={table} />
            <DataTablePagination table={table} />
        </div>
    );
};
