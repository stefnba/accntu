'use client';

import { Card } from '@/components/ui/card';
import { useLabelEndpoints } from '@/features/label/api';
import { LabelTreeItemSortableWrapper } from '@/features/label/components/label-tree/item-sortable-wrapper';
import { LabelTreeItemProvider } from '@/features/label/components/label-tree/provider';
import { cn } from '@/lib/utils';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { memo, useMemo } from 'react';

// ====================
// Standard Label Tree
// ====================

// Types
export interface LabelTreeProps {
    className?: string;
    onSelect?: (labelId: string) => void;
    children?: React.ReactNode;
}

/**
 * Label tree component.
 * Responsible for rendering the label tree container, data fetching and providing the context to the label tree items.
 */
export const LabelTree = memo(function LabelTree({
    className,
    onSelect,
    children,
}: LabelTreeProps) {
    const { data: labels, isLoading } = useLabelEndpoints.getRoots({});

    const rootLabels = useMemo(() => labels || [], [labels]);

    if (isLoading) {
        return (
            <div className="p-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                <span className="ml-2">Loading labels...</span>
            </div>
        );
    }

    if (rootLabels.length === 0) {
        return (
            <Card className={cn('text-center py-8 text-gray-500', className)}>
                <div className="space-y-2">
                    <p>No labels found.</p>
                    <p className="text-sm">Create your first label to get started.</p>
                </div>
            </Card>
        );
    }

    return (
        <div className={cn('space-y-1', className)} role="tree" aria-label="Label tree">
            {rootLabels.map((label) => (
                <LabelTreeItemProvider key={label.id} label={label} onSelect={onSelect}>
                    {children}
                </LabelTreeItemProvider>
            ))}
        </div>
    );
});

// ====================
// Sortable Label Tree
// ====================

export const LabelTreeSortable = memo(function LabelTreeSortable({
    children,
    onSelect,
    className,
}: LabelTreeProps) {
    const { data: labels, isLoading } = useLabelEndpoints.getRoots({});

    const rootLabels = useMemo(() => labels || [], [labels]);
    const labelIds = rootLabels.map((label) => label.id);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id && labels) {
            try {
                const activeIndex = labels.findIndex((label) => label.id === active.id);
                const overIndex = labels.findIndex((label) => label.id === over.id);

                if (activeIndex !== -1 && overIndex !== -1) {
                    // Create new order with the moved item
                    const newOrder = [...labels];
                    const [movedItem] = newOrder.splice(activeIndex, 1);
                    newOrder.splice(overIndex, 0, movedItem);

                    // Create updates array with new sort orders
                    const updates = newOrder.map((label, index) => ({
                        id: label.id,
                        sortOrder: index,
                        parentId: label.parentId || null,
                    }));

                    console.log(updates);

                    // await reorderMutation.mutateAsync({
                    //     json: { updates },
                    // });
                }
            } catch (error) {
                console.error('Error reordering labels:', error);
            }
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <SortableContext items={labelIds} strategy={verticalListSortingStrategy}>
                <div className={cn('space-y-2 w-full ', className)}>
                    {rootLabels.map((label) => (
                        <LabelTreeItemSortableWrapper key={label.id} id={label.id}>
                            <LabelTreeItemProvider key={label.id} label={label} onSelect={onSelect}>
                                {children}
                            </LabelTreeItemProvider>
                        </LabelTreeItemSortableWrapper>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
});
