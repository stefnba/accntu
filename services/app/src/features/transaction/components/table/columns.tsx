'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { TGetTransactionsResponse } from '@/features/transaction/api/get-transactions';
import { storeViewUpdateTransactionSheet } from '@/features/transaction/store/view-update-transaction-sheet';
import { ColumnDef, Row } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { HiOutlineEye } from 'react-icons/hi';
import { LuFileEdit, LuTags } from 'react-icons/lu';
import { RxDotsHorizontal, RxTrash } from 'react-icons/rx';

import { TransactionTableSortableColumnHeader } from './header';
import { Amount, Date, TransactionType } from './utils';

type TRow = TGetTransactionsResponse['transactions'][0];

export const columns: ColumnDef<TRow>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),

        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'date',
        header: () => (
            <TransactionTableSortableColumnHeader
                columnKey="date"
                title="Date"
                enableSorting
            />
        ),
        enableSorting: true,
        cell: ({ row }) => {
            const { date } = row.original;

            return <Date date={date} />;
        },
        sortingFn: 'datetime'
    },
    {
        accessorKey: 'title',
        header: () => (
            <TransactionTableSortableColumnHeader
                title="Title"
                columnKey="title"
            />
        ),
        cell: ({ row }) => {
            const { handleOpen } = storeViewUpdateTransactionSheet();
            const { id, title } = row.original;
            return (
                <Button
                    onClick={() => handleOpen(id)}
                    className="p-0 m-0 h-6"
                    variant="link"
                    size="sm"
                >
                    {title}
                </Button>
            );
        },
        enableSorting: true
    },
    {
        accessorKey: 'account.name',
        // header: ({ column }) => (
        //     <TransactionTableColumnHeader title="Account" column={column} />
        // ),
        header: 'Account',
        enableSorting: true
    },
    {
        accessorFn: (row) => {
            return row.label?.name ?? '';
        },
        accessorKey: 'label.name',
        // header: ({ column }) => (
        //     <TransactionTableColumnHeader title="Label" key={column} />
        // ),
        header: 'Label',
        enableSorting: true
    },
    {
        accessorKey: 'type',
        header: 'Type',
        // header: ({ column }) => (
        //     <TransactionTableColumnHeader title="Type" column={column} />
        // ),
        cell: ({ row }) => {
            const { type } = row.original;

            return <TransactionType type={type} />;
        }
    },
    {
        accessorKey: 'spending_amount',
        enableSorting: true,
        // header: ({ column }) => (
        //     <DataTableColumnHeader
        //         title="Spending Amount"
        //         column={column}
        //         className="justify-end"
        //     />
        // ),
        header: () => <div className="text-right">Amount Spent</div>,
        cell: ({ row }) => {
            const { spendingAmount, spendingCurrency } = row.original;

            return (
                <Amount
                    amountInCents={spendingAmount}
                    currency={spendingCurrency}
                />
            );
        }
    },
    {
        accessorKey: 'account_amount',
        enableSorting: true,
        // header: ({ column }) => (
        //     <DataTableColumnHeader
        //         title="Account Amount"
        //         column={column}
        //         className="justify-end"
        //     />
        // ),
        header: () => <div className="text-right">Amount Booked</div>,
        cell: ({ row }) => {
            const { accountAmount, accountCurrency } = row.original;

            return (
                <Amount
                    amountInCents={accountAmount}
                    currency={accountCurrency}
                />
            );
        }
    },

    {
        id: 'actions',

        cell: ({ row }) => {
            const { id } = row.original;
            const { handleOpen } = storeViewUpdateTransactionSheet();

            return (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                            >
                                <RxDotsHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpen(id)}>
                                <HiOutlineEye className="mr-2 h-4 w-4" />
                                View
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                                <LuFileEdit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Quick Update</DropdownMenuLabel>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <LuTags className="mr-2 h-4 w-4" />
                                    Labels
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuRadioGroup value={'d'}>
                                        {/* {labels.map((label) => (
                <DropdownMenuRadioItem key={label.value} value={label.value}>
                  {label.label}
                </DropdownMenuRadioItem>
              ))} */}
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                                <RxTrash className="mr-2 h-4 w-4" />
                                Delete
                                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        }
    }
];
