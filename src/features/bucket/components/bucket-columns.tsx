'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { selectBucketSchema } from '@/features/bucket/server/db/schemas';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

type Bucket = typeof selectBucketSchema._type;

export const columns = ({ onDelete }: { onDelete: (id: string) => void }): ColumnDef<Bucket>[] => [
    {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => <Link href={`/buckets/${row.original.id}`}>{row.original.title}</Link>,
    },
    {
        accessorKey: 'type',
        header: 'Type',
    },
    {
        accessorKey: 'status',
        header: 'Status',
    },
    {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const bucket = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/buckets/${bucket.id}`}>View</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(bucket.id)}>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
