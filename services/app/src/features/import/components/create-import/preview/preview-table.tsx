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

// const PARSING_SERVER = 'http://127.0.0.1:8000';

// const getParsedTransactions = async (files: IFile[], userId: string) => {
//     const res = await fetch(PARSING_SERVER + '/parse/new', {
//         method: 'POST',
//         body: JSON.stringify({
//             files: files.map((f) => ({ id: f.id, url: f.url })),
//             user_id: userId,
//             parser_id: 'BARCLAYS_DE_CREDITCARD'
//         })
//     });
//     if (!res.ok) {
//         throw new Error('Network response was not ok');
//     }
//     return res.json();
// };

// const [fileId, setFileId] = useState<string>(files[0].id);

// const [rowSelection, setRowSelection] = useState({});

// const newTransactions = transactionData.filter((f) => !f.is_duplicate);

// useEffect(() => {
//     if (isSuccess) {
//         const selectedRows = transactionData.reduce((acc, transaction) => {
//             if (transaction.is_duplicate) return acc;
//             return { ...acc, [transaction.key]: true };
//         }, {});
//         setRowSelection(selectedRows);
//     }
// }, [transactionData, isSuccess]);
