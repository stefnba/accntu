'use client';

import { Card } from '@/components/ui/card';
import { useLabelEndpoints } from '@/features/label/api';
import { LabelTreeItemSortableWrapper } from '@/features/label/components/label-tree/item-sortable-wrapper';
import { SortableLabelTreeItemProvider } from '@/features/label/components/label-tree/sortable-provider';
import { cn } from '@/lib/utils';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import React, { memo, useMemo, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { 
    flatten, 
    getProjection, 
    adjustTree, 
    type TreeItem, 
    type DropProjection 
} from './tree-utilities';

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
    
    // Shared expanded state for sortable tree
    const [expandedLabelIds, setExpandedLabelIds] = useState<Set<string>>(new Set());
    
    const toggleExpandedLabelId = useCallback((labelId: string) => {
        setExpandedLabelIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(labelId)) {
                newSet.delete(labelId);
            } else {
                newSet.add(labelId);
            }
            return newSet;
        });
    }, []);

    const isExpandedLabelId = useCallback(
        (labelId: string) => expandedLabelIds.has(labelId),
        [expandedLabelIds]
    );
    
    // Convert tree structure to flat array for dnd-kit with expanded state
    const flatItems = useMemo(() => flatten(rootLabels as TreeItem[], null, 0, expandedLabelIds), [rootLabels, expandedLabelIds]);
    const labelIds = flatItems.map((item) => item.id);

    const [dragState, setDragState] = useState({
        isDragging: false,
        isUpdating: false,
        activeId: null as string | null,
    });
    
    // Use refs for frequently changing values to avoid re-renders
    const projectionRef = useRef<DropProjection | null>(null);
    const overIdRef = useRef<string | null>(null);

    // Enhanced sensor for better drag detection
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        projectionRef.current = null;
        overIdRef.current = null;
        setDragState((prev) => ({ 
            ...prev, 
            isDragging: true, 
            activeId: String(event.active.id),
        }));
    }, []);

    const handleDragOver = useCallback((event: DragOverEvent) => {
        const { active, over, delta } = event;

        if (!over || !active) return;

        const activeId = String(active.id);
        const overId = String(over.id);
        const offsetLeft = delta.x;

        // Only calculate projection if over a different item or significant movement
        if (overIdRef.current !== overId) {
            const projection = getProjection(flatItems, activeId, overId, offsetLeft);
            projectionRef.current = projection;
            overIdRef.current = overId;
        }
    }, [flatItems]);

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;
        
        setDragState((prev) => ({ 
            ...prev, 
            isDragging: false,
            activeId: null,
        }));

        if (!over || !active || active.id === over.id || !projectionRef.current) {
            return;
        }

        const activeId = String(active.id);
        const projection = projectionRef.current;

        try {
            // Apply tree adjustment
            const adjustedTree = adjustTree(rootLabels as TreeItem[], activeId, projection);
            
            // Create updates array with new hierarchical structure
            const flatAdjusted = flatten(adjustedTree);
            const updates = flatAdjusted.map((item, index) => ({
                id: item.id,
                sortOrder: index,
                parentId: item.parentId,
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

            // Optimistically update the cache with new tree structure
            queryClient.setQueryData(queryKey, adjustedTree);

            // Call the API
            console.log('Tree updates:', updates);
            // await reorderMutation.mutateAsync({ json: { updates } });

            // Success feedback
            toast.success('Labels reordered successfully');
        } catch (error) {
            // Rollback to previous state on error
            const queryKey = ['root_labels', {}];
            const previousLabels = queryClient.getQueryData(queryKey);
            if (previousLabels) {
                queryClient.setQueryData(queryKey, previousLabels);
            }
            toast.error('Failed to reorder labels. Changes have been reverted.');
            console.error('Reorder error:', error);
        } finally {
            setDragState((prev) => ({ ...prev, isUpdating: false }));
        }
    }, [rootLabels, queryClient, reorderMutation]);

    // Render flat items with proper nesting - MUST be before any conditional returns
    const sortableItems = useMemo(() => {
        return flatItems.map((item) => {
            const isGhost = dragState.activeId === item.id;
            
            return (
                <LabelTreeItemSortableWrapper 
                    key={item.id} 
                    id={item.id}
                    depth={item.depth}
                    ghost={isGhost}
                    disableSelection={dragState.isDragging}
                    disableInteraction={dragState.isUpdating}
                >
                    <SortableLabelTreeItemProvider 
                        label={item} 
                        level={item.depth}
                        onSelect={onSelect}
                        expandedLabelIds={expandedLabelIds}
                        toggleExpandedLabelId={toggleExpandedLabelId}
                        isExpandedLabelId={isExpandedLabelId}
                    >
                        {children}
                    </SortableLabelTreeItemProvider>
                </LabelTreeItemSortableWrapper>
            );
        });
    }, [flatItems, dragState.activeId, dragState.isDragging, dragState.isUpdating, children, onSelect, expandedLabelIds, toggleExpandedLabelId, isExpandedLabelId]);

    // Find the currently dragged item for the overlay
    const activeItem = useMemo(() => {
        if (!dragState.activeId) return null;
        return flatItems.find(item => item.id === dragState.activeId);
    }, [dragState.activeId, flatItems]);

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
            <DndContext 
                sensors={sensors}
                onDragStart={handleDragStart} 
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={labelIds} strategy={verticalListSortingStrategy}>
                    <div className={cn('space-y-1 w-full', className)}>
                        {sortableItems}
                    </div>
                </SortableContext>
                
                <DragOverlay>
                    {activeItem ? (
                        <div className="bg-white shadow-lg ring-1 ring-black/5 rounded-lg p-2 transform rotate-2 scale-105">
                            <SortableLabelTreeItemProvider 
                                label={activeItem} 
                                level={0}
                                onSelect={onSelect}
                                expandedLabelIds={expandedLabelIds}
                                toggleExpandedLabelId={toggleExpandedLabelId}
                                isExpandedLabelId={isExpandedLabelId}
                            >
                                {children}
                            </SortableLabelTreeItemProvider>
                        </div>
                    ) : null}
                </DragOverlay>
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
