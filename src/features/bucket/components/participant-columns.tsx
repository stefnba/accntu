'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { selectBucketParticipantSchema } from '@/features/bucket/server/db/schemas';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

type Participant = typeof selectBucketParticipantSchema._type;

export const columns = ({
    onDelete,
}: {
    onDelete: (id: string) => void;
}): ColumnDef<Participant>[] => [
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'createdAt',
        header: 'Added At',
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const participant = row.original;

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
                        <DropdownMenuItem onClick={() => onDelete(participant.id)}>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
