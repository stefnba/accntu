'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LabelBadge } from '@/features/label/components/label-badge';
import { useLabelModal } from '@/features/label/hooks';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Edit2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useLabelEndpoints } from '../api';
import type { TLabelQuery } from '../schemas';

interface LabelTreeProps {
    className?: string;
}

interface LabelTreeItemProps {
    label: TLabelQuery['select'] & { children?: TLabelQuery['select'][] };
    level?: number;
    actions?: React.ReactNode;
}

/**
 * Single label in the tree
 */
export const LabelTreeItem = ({ label, level = 0, actions }: LabelTreeItemProps) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = label.children && label.children.length > 0;

    /**
     * Render the collapse button for the label
     */
    const renderCollapseButton = () => {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex-shrink-0 w-4 h-4 flex items-center justify-center"
            >
                {hasChildren ? (
                    isExpanded ? (
                        <ChevronDown className="w-3 h-3" />
                    ) : (
                        <ChevronRight className="w-3 h-3" />
                    )
                ) : (
                    <div className="w-3 h-3" />
                )}
            </Button>
        );
    };

    /**
     * Render the label actions
     * @returns
     */
    const renderLabelActions = () => {
        if (!actions) {
            return null;
        }

        return (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {actions}
            </div>
        );
    };

    /**
     * Render the label children
     * @returns
     */
    const renderLabelChildren = () => {
        if (!hasChildren || !isExpanded) {
            return null;
        }

        return (
            <div className="space-y-1">
                {label.children?.map((child) => (
                    <LabelTreeItem
                        key={child.id}
                        label={child}
                        level={level + 1}
                        actions={actions ? <LabelTreeItemActions labelId={child.id} /> : null}
                    />
                ))}
            </div>
        );
    };
    return (
        <div className="space-y-1">
            <div
                className={cn(
                    'flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 group',
                    level > 0 && 'ml-6'
                )}
            >
                {/* Expand/collapse button */}
                {renderCollapseButton()}

                {/* Label badge */}
                <LabelBadge label={label} />

                {/* Label actions */}
                {renderLabelActions()}
            </div>

            {/* Label children */}
            {renderLabelChildren()}
        </div>
    );
};

interface LabelTreeItemActionsProps {
    labelId: string;
}

/**
 * Actions for a label tree item

 */
export const LabelTreeItemActions = ({ labelId }: LabelTreeItemActionsProps) => {
    const { openCreateModal, openEditModal } = useLabelModal();

    const deleteMutation = useLabelEndpoints.delete();

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this label?')) {
            await deleteMutation.mutateAsync({ param: { id: labelId } });
        }
    };

    const handleEdit = () => {
        // labelId is the label id to edit
        openEditModal(labelId);
    };

    const handleAddChild = () => {
        // labelId is the parent label id
        openCreateModal(labelId);
    };

    return (
        <>
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
};

export const LabelTree = ({ className }: LabelTreeProps) => {
    const { data: labels, isLoading } = useLabelEndpoints.getRoots({});

    if (isLoading) {
        return <div className="p-4">Loading labels...</div>;
    }

    if (!labels || labels.length === 0) {
        return (
            <Card className={cn('text-center py-8 text-gray-500', className)}>
                No labels found. Create your first label to get started.
            </Card>
        );
    }

    return (
        <Card className={cn('space-y-1', className)}>
            <CardContent>
                {labels.map((label) => (
                    <LabelTreeItem
                        key={label.id}
                        label={label}
                        actions={<LabelTreeItemActions labelId={label.id} />}
                    />
                ))}
            </CardContent>
        </Card>
    );
};
