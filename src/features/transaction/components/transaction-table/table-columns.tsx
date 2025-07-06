'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TTransactionServicesResponse } from '@/features/transaction/server/services';
import {
    IconArrowsUpDown,
    IconCalendar,
    IconTrendingDown,
    IconTrendingUp,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { EditableAmountCell, EditableSelectCell, EditableTextCell } from './transaction-edit-cells';

export type TTransaction = TTransactionServicesResponse['getAll']['transactions'][number];

export const createTransactionColumns = (
    onRowClick?: (transaction: TTransaction) => void,
    filterOptions?: {
        labels?: Array<{ id: string; name: string; color: string | null }>;
    },
    enableSelection = false
): ColumnDef<TTransaction>[] => [
    // Selection column (only if enabled)
    ...(enableSelection
        ? [
              {
                  id: 'select',
                  header: ({ table }: any) => (
                      <div className="flex items-center justify-center">
                          <input
                              type="checkbox"
                              checked={
                                  table.getIsAllPageRowsSelected() ||
                                  (table.getIsSomePageRowsSelected() && 'indeterminate')
                              }
                              onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
                              className="h-4 w-4 rounded border border-gray-300"
                          />
                      </div>
                  ),
                  cell: ({ row }: any) => (
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
              },
          ]
        : []),
    {
        accessorKey: 'date',
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
            const date = new Date(row.getValue('date'));
            return (
                <div
                    className="flex flex-col cursor-pointer"
                    onClick={() => onRowClick?.(row.original)}
                >
                    <span className="font-medium">{format(date, 'MMM dd, yyyy')}</span>
                    <span className="text-xs text-muted-foreground">{format(date, 'EEEE')}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'title',
        header: 'Description',
        cell: ({ row }) => {
            const title = row.getValue('title') as string;
            const description = row.original.description;
            const counterparty = row.original.counterparty;
            const reference = row.original.reference;

            return (
                <div className="max-w-[300px] space-y-2">
                    <EditableTextCell transaction={row.original} field="title" value={title} />
                    {description && (
                        <EditableTextCell
                            transaction={row.original}
                            field="description"
                            value={description}
                        />
                    )}
                    {(counterparty || reference) && (
                        <div className="text-xs text-muted-foreground space-y-1">
                            {counterparty && (
                                <div className="truncate">
                                    <span className="font-medium">To:</span> {counterparty}
                                </div>
                            )}
                            {reference && (
                                <div className="truncate">
                                    <span className="font-medium">Ref:</span> {reference}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        },
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
    },
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
            const type = row.getValue('type') as string;
            const variant =
                type === 'credit' ? 'default' : type === 'debit' ? 'destructive' : 'secondary';
            const icon =
                type === 'credit'
                    ? IconTrendingUp
                    : type === 'debit'
                      ? IconTrendingDown
                      : IconArrowsUpDown;
            const Icon = icon;

            return (
                <Badge variant={variant} className="capitalize">
                    <Icon className="w-3 h-3 mr-1" />
                    {type}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'spendingAmount',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="h-8 p-0 hover:bg-transparent"
                >
                    Amount
                    <IconArrowsUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
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
                <div className={`${textColor}`}>
                    <EditableAmountCell
                        transaction={row.original}
                        field="spendingAmount"
                        value={Math.abs(spendingAmount)}
                    />
                </div>
            );
        },
    },
    {
        accessorKey: 'label',
        header: 'Label',
        cell: ({ row }) => {
            const label = row.original.label;
            const labels = filterOptions?.labels || [];

            return (
                <EditableSelectCell
                    transaction={row.original}
                    field="labelId"
                    value={label?.id || ''}
                    options={labels.map((l) => ({
                        id: l.id,
                        name: l.name,
                        color: l.color || undefined,
                    }))}
                    placeholder="Select label"
                />
            );
        },
    },
    {
        accessorKey: 'tags',
        header: 'Tags',
        cell: ({ row }) => {
            const tags = row.original.tags || [];
            if (!tags.length) return <span className="text-muted-foreground">—</span>;

            return (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {tags.slice(0, 2).map((tag) => (
                        <Badge
                            key={tag.id}
                            variant="secondary"
                            className="text-xs"
                            style={{
                                backgroundColor: `${tag.color}20`,
                                borderColor: tag.color,
                                color: tag.color,
                            }}
                        >
                            {tag.name}
                        </Badge>
                    ))}
                    {tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                            +{tags.length - 2}
                        </Badge>
                    )}
                </div>
            );
        },
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
    },
];

export const transactionColumns = createTransactionColumns();
