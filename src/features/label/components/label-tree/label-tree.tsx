'use client';

import { Card } from '@/components/ui/card';
import { useLabelEndpoints } from '@/features/label/api';
import { LabelTreeItemSortableWrapper } from '@/features/label/components/label-tree/item-sortable-wrapper';
import { LabelTreeItemProvider } from '@/features/label/components/label-tree/provider';
import { cn } from '@/lib/utils';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import React, { memo, useMemo, useState } from 'react';
import { toast } from 'sonner';

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

/**
 * Sortable label tree component.
 * Responsible for rendering the label tree container, data fetching and providing the context to the label tree items.
 * This component is used to sort the labels in the tree by dragging and dropping.
 */
export const LabelTreeSortable = memo(function LabelTreeSortable({
    children,
    onSelect,
    className,
}: LabelTreeProps) {
    const { data: labels, isLoading } = useLabelEndpoints.getRoots({});
    const reorderMutation = useLabelEndpoints.reorder();
    const queryClient = useQueryClient();

    const rootLabels = useMemo(() => labels || [], [labels]);
    const labelIds = rootLabels.map((label) => label.id);

    const [dragState, setDragState] = useState({
        isDragging: false,
        isUpdating: false,
    });

    const handleDragStart = () => {
        setDragState((prev) => ({ ...prev, isDragging: true }));
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setDragState((prev) => ({ ...prev, isDragging: false }));

        const { active, over } = event;

        if (over && active.id !== over.id && labels) {
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

                // Optimistic update - Update UI immediately
                setDragState((prev) => ({ ...prev, isUpdating: true }));

                // Correct query key with empty object parameter
                const queryKey = ['root_labels', {}];

                // Cancel outgoing refetches to avoid race conditions
                await queryClient.cancelQueries({
                    queryKey: ['root_labels'],
                });

                // Snapshot the previous value for potential rollback
                const previousLabels = queryClient.getQueryData(queryKey);

                // Optimistically update the cache with correct query key
                queryClient.setQueryData(queryKey, newOrder);

                try {
                    // Call the API
                    console.log(updates);
                    // await reorderMutation.mutateAsync({ json: { updates } });

                    // Success feedback
                    toast.success('Labels reordered successfully');
                } catch (error) {
                    // Rollback to previous state on error
                    if (previousLabels) {
                        queryClient.setQueryData(queryKey, previousLabels);
                    }
                    toast.error('Failed to reorder labels. Changes have been reverted.');
                    console.error('Reorder error:', error);
                } finally {
                    setDragState((prev) => ({ ...prev, isUpdating: false }));

                    // Always invalidate queries to sync with server state
                    // queryClient.invalidateQueries({
                    //     queryKey: ['root_labels'],
                    // });
                }
            }
        }
    };

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
        <div className="relative">
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <SortableContext items={labelIds} strategy={verticalListSortingStrategy}>
                    <div className={cn('space-y-2 w-full', className)}>
                        {rootLabels.map((label) => (
                            <LabelTreeItemSortableWrapper key={label.id} id={label.id}>
                                <LabelTreeItemProvider label={label} onSelect={onSelect}>
                                    {children}
                                </LabelTreeItemProvider>
                            </LabelTreeItemSortableWrapper>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Loading overlay when updating */}
            {dragState.isUpdating && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-lg border">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm font-medium text-gray-700">Saving order...</span>
                    </div>
                </div>
            )}
        </div>
    );
});
