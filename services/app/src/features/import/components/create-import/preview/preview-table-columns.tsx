'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table';
import type { TParsedTransaction } from '@/features/import/schema/preview-transactions';
import {
    Amount,
    Date,
    TransactionType
} from '@/features/transaction/components/table/utils';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';

export const columns: ColumnDef<TParsedTransaction>[] = [
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
        header: 'Spending Amount',
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
    },
    {
        accessorKey: 'isDuplicate',
        header: 'Duplicate'
    }
];
// {
//     id: 'select',
//     header: ({ table }) => (
//         <Checkbox
//             checked={
//                 table.getIsAllPageRowsSelected() ||
//                 (table.getIsSomePageRowsSelected() && 'indeterminate')
//             }
//             onCheckedChange={(value) =>
//                 table.toggleAllPageRowsSelected(!!value)
//             }
//             aria-label="Select all"
//             className="translate-y-[2px]"
//         />
//     ),
//     cell: ({ row }) => {
//         if (row.original.is_duplicate == true) return null;

//         return (
//             <Checkbox
//                 checked={row.getIsSelected()}
//                 onCheckedChange={(value) => row.toggleSelected(!!value)}
//                 aria-label="Select row"
//                 className="translate-y-[2px]"
//             />
//         );
//     },
//     enableSorting: false,
//     enableHiding: false
// },
//     {
//         accessorKey: 'is_duplicate',
//         header: 'Status',
//         enableSorting: true,
//         cell: ({ row }) => {
//             const { is_duplicate } = row.original;

//             if (is_duplicate) {
//                 return (
//                     <Badge
//                         className="text-muted-foreground rounded-md"
//                         variant="outline"
//                     >
//                         Duplicate
//                     </Badge>
//                 );
//             }

//             return <Badge className="rounded-md">New</Badge>;
//         }
//     },
//     {
//         accessorKey: 'date',
//         header: ({ column }) => (
//             <DataTableColumnHeader column={column} title="Date" />
//         ),
//         enableSorting: true,
//         cell: ({ row }) => {
//             const { date } = row.original;

//             return <span>{dayjs(date).format('DD-MMM YY')}</span>;
//         },
//         sortingFn: 'datetime'
//     },
//     {
//         accessorKey: 'title',
//         header: ({ column }) => (
//             <DataTableColumnHeader title="Title" column={column} />
//         ),
//         enableSorting: true
//     },
//     {
//         accessorKey: 'spending_amount',
//         enableSorting: true,
//         header: ({ column }) => (
//             <DataTableColumnHeader
//                 title="Spending Amount"
//                 column={column}
//                 className="justify-end"
//             />
//         ),
//         // header: () => <div className="text-right">Amount</div>,
//         cell: ({ row }) => {
//             const { spending_amount, spending_currency } = row.original;

//             return (
//                 <div className="text-right pr-4">
//                     {spending_amount.toLocaleString('en-US', {
//                         maximumFractionDigits: 2,
//                         minimumFractionDigits: 2,
//                         currency: spending_currency
//                     })}{' '}
//                     {spending_currency}
//                 </div>
//             );
//         }
//     },
//     {
//         accessorKey: 'account_amount',
//         enableSorting: true,
//         header: ({ column }) => (
//             <DataTableColumnHeader
//                 title="Account Amount"
//                 column={column}
//                 className="justify-end"
//             />
//         ),
//         // header: () => <div className="text-right">Amount</div>,
//         cell: ({ row }) => {
//             const { account_amount, account_currency } = row.original;

//             return (
//                 <div className="text-right pr-4">
//                     {account_amount.toLocaleString('en-US', {
//                         maximumFractionDigits: 2,
//                         minimumFractionDigits: 2,
//                         currency: account_currency
//                     })}{' '}
//                     {account_currency}
//                 </div>
//             );
//         }
//     },
//     {
//         accessorKey: 'type',
//         header: ({ column }) => (
//             <DataTableColumnHeader title="Type" column={column} />
//         ),
//         cell: ({ row }) => {
//             const { type } = row.original;

//             if (type == 'DEBIT') {
//                 return <Badge variant="outline">Debit</Badge>;
//             }

//             return <Badge variant="outline">Credit</Badge>;
//         }
//     }
// ];
