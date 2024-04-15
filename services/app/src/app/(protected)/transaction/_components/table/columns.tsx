'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Transaction } from '@prisma/client';
import { ColumnDef, Row } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { RxDotsHorizontal } from 'react-icons/rx';

export const columns: ColumnDef<Transaction>[] = [
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
        // header: 'Date',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Date" />
        ),
        enableSorting: true,
        cell: ({ row }) => {
            const { date } = row.original;

            return <span>{dayjs(date).format('DD-MMM YY')}</span>;
        },
        sortingFn: 'datetime'
    },
    {
        accessorKey: 'title',
        header: ({ column }) => (
            <DataTableColumnHeader title="Title" column={column} />
        ),
        enableSorting: true
    },
    {
        accessorKey: 'account.name',
        header: ({ column }) => (
            <DataTableColumnHeader title="Account" column={column} />
        ),
        enableSorting: true
    },
    {
        accessorKey: 'label.name',
        header: ({ column }) => (
            <DataTableColumnHeader title="Label" column={column} />
        ),
        enableSorting: true
    },
    {
        accessorKey: 'type',
        header: ({ column }) => (
            <DataTableColumnHeader title="Type" column={column} />
        ),
        cell: ({ row }) => {
            const { type } = row.original;

            if (type == 'DEBIT') {
                return <Badge variant="outline">Debit</Badge>;
            }

            return <Badge variant="outline">Credit</Badge>;
        }
    },
    {
        accessorKey: 'spending_amount',
        enableSorting: true,
        header: ({ column }) => (
            <DataTableColumnHeader
                title="Spending Amount"
                column={column}
                className="justify-end"
            />
        ),
        // header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const { spendingAmount, spendingCurrency } = row.original;

            return (
                <div className="text-right pr-4">
                    {spendingAmount.toLocaleString('en-US', {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                        currency: spendingCurrency
                    })}{' '}
                    {spendingCurrency}
                </div>
            );
        }
    },
    {
        accessorKey: 'account_amount',
        enableSorting: true,
        header: ({ column }) => (
            <DataTableColumnHeader
                title="Account Amount"
                column={column}
                className="justify-end"
            />
        ),
        // header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const { accountAmount, accountCurrency } = row.original;

            return (
                <div className="text-right pr-4">
                    {accountAmount.toLocaleString('en-US', {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                        currency: accountCurrency
                    })}{' '}
                    {accountCurrency}
                </div>
            );
        }
    },

    {
        id: 'actions',

        cell: ({ row }) => {
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
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Make a copy</DropdownMenuItem>
                            <DropdownMenuItem>Favorite</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
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
                            <DropdownMenuItem>
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
