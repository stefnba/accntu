'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    IconDotsVertical,
    IconEye,
    IconEdit,
    IconTrash,
    IconCopy,
    IconTag,
    IconArchive,
    IconChevronRight,
} from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { TTransaction } from './table-columns';

interface TransactionActionsMenuProps {
    transaction: TTransaction;
    onView?: (transaction: TTransaction) => void;
    onEdit?: (transaction: TTransaction) => void;
}

export const TransactionActionsMenu = ({
    transaction,
    onView,
    onEdit,
}: TransactionActionsMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation();
        onView?.(transaction);
        setIsOpen(false);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit?.(transaction);
        setIsOpen(false);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            // TODO: Implement delete API call
            toast.success('Transaction deleted');
        }
        setIsOpen(false);
    };

    const handleDuplicate = (e: React.MouseEvent) => {
        e.stopPropagation();
        // TODO: Implement duplicate functionality
        toast.info('Duplicate functionality coming soon');
        setIsOpen(false);
    };

    const handleArchive = (e: React.MouseEvent) => {
        e.stopPropagation();
        // TODO: Implement archive functionality
        toast.info('Archive functionality coming soon');
        setIsOpen(false);
    };

    const handleAddTag = (e: React.MouseEvent) => {
        e.stopPropagation();
        // TODO: Implement add tag functionality
        toast.info('Add tag functionality coming soon');
        setIsOpen(false);
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                >
                    <IconDotsVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleView}>
                    <IconEye className="mr-2 h-4 w-4" />
                    View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                    <IconEdit className="mr-2 h-4 w-4" />
                    Edit Transaction
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <IconTag className="mr-2 h-4 w-4" />
                        Quick Actions
                        <IconChevronRight className="ml-auto h-4 w-4" />
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={handleDuplicate}>
                            <IconCopy className="mr-2 h-4 w-4" />
                            Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleAddTag}>
                            <IconTag className="mr-2 h-4 w-4" />
                            Add Tag
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleArchive}>
                            <IconArchive className="mr-2 h-4 w-4" />
                            Archive
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <IconTrash className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};