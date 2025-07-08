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
import { useLabelSelectorModal } from '@/features/label/hooks';
import { useTagSelectorModal } from '@/features/tag/hooks';
import {
    IconArchive,
    IconCopy,
    IconDotsVertical,
    IconEdit,
    IconEye,
    IconLabel,
    IconTag,
    IconTrash,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface TransactionActionsMenuProps {
    transactionId: string;
}

export const TransactionActionsMenu = ({ transactionId }: TransactionActionsMenuProps) => {
    // =========================
    // API calls
    // =========================

    // =========================
    // Hooks
    // =========================
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { open: openLabelSelector } = useLabelSelectorModal();
    const { open: openTagSelector } = useTagSelectorModal();

    // =========================
    // Handlers
    // =========================
    const clickWrapper = (fn: () => void) => (e: React.MouseEvent) => {
        e.stopPropagation();
        fn();
        setIsOpen(false);
    };

    const handleView = clickWrapper(() => {
        router.push(`/transactions/${transactionId}`);
    });

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();

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

    const handleAddLabel = (e: React.MouseEvent) => {
        e.stopPropagation();
        // TODO: Implement add label functionality
        toast.info('Add label functionality coming soon');
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
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={handleDuplicate}>
                            <IconCopy className="mr-2 h-4 w-4" />
                            Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openTagSelector({ transactionId })}>
                            <IconTag className="mr-2 h-4 w-4" />
                            Update Tags
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openLabelSelector({ transactionId })}>
                            <IconLabel className="mr-2 h-4 w-4" />
                            Update Label
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
