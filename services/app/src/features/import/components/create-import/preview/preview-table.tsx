import { DataTable, DataTablePagination } from '@/components/ui/data-table';
import { usePreviewTransactions } from '@/features/import/api/preview-transactions';
import { storeCreateImportData } from '@/features/import/store/create-import-data';
import { storePreviewImportFiles } from '@/features/import/store/preview-import-files';
import {
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
    const { importId } = storeCreateImportData();
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
        enableSorting: true,
        getSortedRowModel: getSortedRowModel(),
        // getPaginationRowModel: getPaginationRowModel(),
        getRowId: (row) => row.key,
        initialState: {
            sorting: [
                { id: 'isDuplicate', desc: false },
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

    if (!importId || !fileId) {
        return (
            <div className="h-96">
                <h1>No Import File selected</h1>
                <p>Please select an import file to view the transactions</p>
            </div>
        );
    }

    return (
        <div className="overflow-y-scroll h-[600px]">
            <DataTable table={table} />
            {/* <DataTablePagination table={table} /> */}
        </div>
    );
};
