'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TagBadge } from '@/features/tag/components/tag-badge';
import { useTransactionPeek } from '@/features/transaction/hooks';
import { TTransaction as TTransactionQuery } from '@/features/transaction/server/db/queries';
import { formatCurrency } from '@/features/transaction/utils';
import { formatDate } from '@/lib/utils/date-formatter';
import { IconArrowsUpDown, IconCalendar } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { LabelEditCell, TagEditCell, TypeEditCell } from './label-edit-cell';
import { TransactionActionsMenu } from './transaction-actions-menu';

export type TTransaction = TTransactionQuery;
export type TransactionWithRelations = TTransaction;

/**
 * Transaction column definition.
 * @param header - The header of the column.
 * @param label - The label of the column.
 * @param isDefaultVisible - Whether the column is visible by default.
 */
export type TransactionColumnDef = ColumnDef<TTransaction> & { isDefaultVisible?: boolean };

/**
 * Transaction columns.
 */
export const transactionColumns: TransactionColumnDef[] = [
    {
        id: 'select',
        meta: {
            label: 'Select',
        },
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <input
                    type="checkbox"
                    checked={table.getIsAllPageRowsSelected()}
                    ref={(el) => {
                        if (el)
                            el.indeterminate =
                                table.getIsSomePageRowsSelected() &&
                                !table.getIsAllPageRowsSelected();
                    }}
                    onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
                    className="h-4 w-4 rounded border border-gray-300"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={(e) => row.toggleSelected(e.target.checked)}
                    className="h-4 w-4 rounded border border-gray-300"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
        isDefaultVisible: true,
    },
    {
        accessorKey: 'date',
        meta: {
            label: 'Date',
        },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-8 p-0 hover:bg-transparent"
                >
                    <IconCalendar className="mr-2 h-4 w-4" />
                    Date
                    <IconArrowsUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const dateValue = row.getValue('date') as string;
            if (!dateValue) return <span className="text-muted-foreground">No date</span>;

            const date = formatDate(dateValue);

            return (
                <div className="flex flex-col">
                    <span className="font-medium">{date.format('DEFAULT_DATE')}</span>
                    <span className="text-xs text-muted-foreground">{date.dayOfWeekName()}</span>
                </div>
            );
        },
        enableHiding: false, // Date is required
    },
    {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => {
            const { title } = row.original;
            const { openPeek } = useTransactionPeek();

            const maxLength = 30;

            return (
                <Button
                    variant="link"
                    className="hover:underline cursor-pointer p-0 m-0 font-semibold"
                    onClick={() => openPeek(row.original.id)}
                >
                    {title.length > maxLength ? title.slice(0, maxLength) + '...' : title}
                </Button>
            );
        },
        enableHiding: false, // Description is required
        isDefaultVisible: true,
    },
    {
        accessorKey: 'account',
        header: 'Account',
        cell: ({ row }) => {
            const account = row.original.account;
            if (!account) return <span className="text-muted-foreground">—</span>;

            const bankName = account.connectedBank?.globalBank?.name;
            const bankColor = account.connectedBank?.globalBank?.color;

            return (
                <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[150px]">{account.name}</span>
                    {bankName && (
                        <span
                            className="text-xs truncate max-w-[150px]"
                            style={{ color: bankColor || undefined }}
                        >
                            {bankName}
                        </span>
                    )}
                </div>
            );
        },
        enableHiding: true, // Account can be hidden
        isDefaultVisible: true,
    },
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
            return <TypeEditCell transaction={row.original} />;
        },
        enableHiding: true, // Type can be hidden
        isDefaultVisible: true,
    },
    {
        accessorKey: 'spendingAmount',
        meta: {
            label: 'Amount',
        },
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const spendingAmount = parseFloat(row.getValue('spendingAmount'));
            const spendingCurrency = row.original.spendingCurrency;
            const type = row.original.type;

            const displayAmount =
                type === 'debit' ? -Math.abs(spendingAmount) : Math.abs(spendingAmount);
            const textColor =
                type === 'credit'
                    ? 'text-green-600'
                    : type === 'debit'
                      ? 'text-red-600'
                      : 'text-foreground';

            return (
                <div className={`font-medium text-right ${textColor}`}>
                    {formatCurrency(displayAmount, spendingCurrency)}
                </div>
            );
        },
        enableHiding: false, // Amount is required
    },
    {
        accessorKey: 'label',
        header: 'Label',
        cell: ({ row }) => {
            return <LabelEditCell transaction={row.original} />;
        },
        enableHiding: true, // Label can be hidden
    },
    {
        accessorKey: 'tags',
        header: 'Tags',
        cell: ({ row }) => {
            const tags = row.original.tags || [];

            return <TagEditCell transaction={row.original} />;

            if (!tags.length) return <span className="text-muted-foreground">—</span>;

            return (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {tags.slice(0, 2).map((tag) => (
                        <TagBadge size="sm" key={tag.id} tag={tag} />
                    ))}
                    {tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                            +{tags.length - 2}
                        </Badge>
                    )}
                </div>
            );
        },
        enableHiding: true, // Tags can be hidden
        isDefaultVisible: true,
    },
    {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ row }) => {
            const city = row.original.city;
            const country = row.original.country;

            if (!city && !country) return <span className="text-muted-foreground">—</span>;

            return (
                <div className="text-sm">
                    {city && <div className="font-medium">{city}</div>}
                    {country && <div className="text-muted-foreground text-xs">{country}</div>}
                </div>
            );
        },
        enableHiding: true, // Location can be hidden
    },
    {
        id: 'actions',
        meta: {
            label: 'Actions',
        },
        header: () => null,
        cell: ({ row }) => <TransactionActionsMenu transactionId={row.original.id} />,
        enableSorting: false,
        enableHiding: false,
    },
];
