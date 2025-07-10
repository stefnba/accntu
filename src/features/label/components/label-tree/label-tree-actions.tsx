'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLabelModal } from '@/features/label/hooks';
import { cn } from '@/lib/utils';
import { Edit2, Eye, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLabelEndpoints } from '../../api';
import { useLabelTreeContext } from './provider';

export interface LabelTreeItemActionsContentProps {
    labelId: string;
}

export function LabelTreeItemActionsWrapper({ className }: React.ComponentProps<'div'>) {
    const { currentLabel, showActions } = useLabelTreeContext();

    if (!currentLabel || !showActions) return null;

    return (
        <div
            data-slot="label-tree-item-actions"
            className={cn(
                'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
                className
            )}
        >
            <LabelTreeItemActionsContent labelId={currentLabel.id} />
        </div>
    );
}

export function LabelTreeItemActionsContent({ labelId }: LabelTreeItemActionsContentProps) {
    const { openCreateModal, openEditModal } = useLabelModal();
    const router = useRouter();
    const deleteMutation = useLabelEndpoints.delete();

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this label?')) {
            await deleteMutation.mutateAsync({ param: { id: labelId } });
        }
    };

    const handleEdit = () => {
        openEditModal(labelId);
    };

    const handleAddChild = () => {
        openCreateModal(labelId);
    };

    const handleView = () => {
        router.push(`/labels/${labelId}`);
    };

    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handleView} className="h-6 w-6 p-0">
                        <Eye className="w-3 h-3" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>View label</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAddChild}
                        className="h-6 w-6 p-0"
                    >
                        <Plus className="w-3 h-3" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Add child label</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handleEdit} className="h-6 w-6 p-0">
                        <Edit2 className="w-3 h-3" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Edit label</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Delete label</TooltipContent>
            </Tooltip>
        </>
    );
}

// Legacy export for backward compatibility
export const LabelTreeItemActions = LabelTreeItemActionsContent;
