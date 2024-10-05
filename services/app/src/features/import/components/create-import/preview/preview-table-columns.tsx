'use client';

import { Badge } from '@/components/ui/badge';
import type { TPreviewTransactionReponse } from '@/features/import/api/preview-transactions';
import {
    Amount,
    Date,
    TransactionType
} from '@/features/transaction/components/table/utils';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<TPreviewTransactionReponse[0]>[] = [
    {
        accessorKey: 'isDuplicate',
        header: 'Status',
        cell: ({ row }) => {
            return (
                <Badge
                    variant={row.original.isDuplicate ? 'secondary' : 'default'}
                >
                    {row.original.isDuplicate ? 'Duplicate' : 'New'}
                </Badge>
            );
        }
    },
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => {
            const { date } = row.original;

            return <Date date={date} />;
        }
    },
    {
        accessorKey: 'title',
        header: 'Title'
    },
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
            const { type } = row.original;

            return <TransactionType type={type} />;
        }
    },
    {
        accessorKey: 'spendingAmount',
        header: 'Transaction Amount',
        cell: ({ row }) => {
            const { spendingAmount, spendingCurrency } = row.original;

            return (
                <Amount
                    currency={spendingCurrency}
                    amountInCents={spendingAmount}
                />
            );
        }
    },
    {
        accessorKey: 'userAmount',
        header: 'User Amount',
        cell: ({ row }) => {
            const { userAmount, userCurrency } = row.original;

            return (
                <Amount currency={userCurrency} amountInCents={userAmount} />
            );
        }
    }
];
