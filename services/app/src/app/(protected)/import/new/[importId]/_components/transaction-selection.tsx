'use client';

import { transactionActions } from '@/actions';
import { Button } from '@/components/ui/button';
import { DataTable, DataTablePagination } from '@/components/ui/data-table';
import { useMutation } from '@/hooks/mutation';
import { useQuery } from '@tanstack/react-query';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable
} from '@tanstack/react-table';
import { use, useEffect, useMemo, useState } from 'react';

import type { IFile, TParsedTransaction } from '../_types';
import { ImportSuccess } from './success';
import { columns } from './table-columns';

interface Props {
    files: IFile[];
    importId: string;
    accountId: string;
    userId: string;
}

type TQueryReturnData = Record<string, TParsedTransaction[]>;

const PARSING_SERVER = 'http://127.0.0.1:8000';

const getParsedTransactions = async (files: IFile[], userId: string) => {
    const res = await fetch(PARSING_SERVER + '/parse/new', {
        method: 'POST',
        body: JSON.stringify({
            files: files.map((f) => ({ id: f.id, url: f.url })),
            user_id: userId,
            parser_id: 'BARCLAYS_DE_CREDITCARD'
        })
    });
    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    return res.json();
};

export const TransactionSelection: React.FC<Props> = ({
    files,
    importId,
    accountId,
    userId
}) => {
    const {
        data = {},
        isLoading,
        isSuccess
    } = useQuery<TQueryReturnData>({
        queryKey: ['newImport', importId],
        queryFn: () => getParsedTransactions(files, userId)
    });

    const [fileId, setFileId] = useState<string>(files[0].id);

    const [rowSelection, setRowSelection] = useState({});

    const transactionData = useMemo(() => data[fileId] || [], [data, fileId]);
    const newTransactions = transactionData.filter((f) => !f.is_duplicate);

    useEffect(() => {
        if (isSuccess) {
            const selectedRows = transactionData.reduce((acc, transaction) => {
                if (transaction.is_duplicate) return acc;
                return { ...acc, [transaction.key]: true };
            }, {});
            setRowSelection(selectedRows);
        }
    }, [transactionData, isSuccess]);

    const table = useReactTable({
        data: transactionData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        enableSorting: true,
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            rowSelection
        },
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

    const {
        execute: executeCreateTransactions,
        status,
        data: importedTransactionResponse
    } = useMutation(transactionActions.create, {
        onSuccess(data) {},
        onFieldError(error) {
            console.log('error', error);
        },
        onError(error) {
            console.log('error', error);
        }
    });

    if (status === 'LOADING') {
        return <div>Importing Transactions...</div>;
    }

    if (status === 'SUCCESS' && importedTransactionResponse) {
        return (
            <ImportSuccess
                countTransactions={importedTransactionResponse.length}
            />
        );
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!data) {
        return <div>Error</div>;
    }

    return (
        <div>
            <Button
                className="mb-4"
                onClick={() =>
                    executeCreateTransactions({
                        transactions: newTransactions,
                        accountId,
                        importId
                    })
                }
            >
                Import {newTransactions.length} Transactions
            </Button>
            <DataTable table={table} />

            <DataTablePagination table={table} />
        </div>
    );
};
