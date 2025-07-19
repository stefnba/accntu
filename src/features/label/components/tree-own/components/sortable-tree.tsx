'use client';

import { TreeItem } from '@/features/label/components/tree-own/components/item';
import { SortableItem } from '@/features/label/components/tree-own/components/sortable-item';
import { useSortableTree } from '@/features/label/components/tree-own/hooks';
import { TreeItem as TreeItemType } from '@/features/label/components/tree-own/types';
import {
    canDropItem,
    getChildCount,
    moveTreeItem,
    removeChildrenOf,
} from '@/features/label/components/tree-own/utils';
import { cn } from '@/lib/utils';
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    MeasuringStrategy,
    MouseSensor,
    pointerWithin,
    rectIntersection,
    TouchSensor,
    UniqueIdentifier,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { startTransition, useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

interface SortableTreeProps {
    onItemMove?: (items: TreeItemType[]) => void;
    onItemToggle?: (itemId: string, collapsed: boolean) => void;
    className?: string;
}

export const SortableTreeOwn = ({
    onItemMove,

    className,
}: SortableTreeProps) => {
    const { flattenedItems, items } = useSortableTree();

    // Track the ID of the currently dragged item - useState is best practice here
    // as it's component-scoped state that triggers re-renders for the drag overlay
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

    // Hide children of items being dragged - OPTIMIZED
    const flattenedAndFilteredItems = useMemo(() => {
        // No filtering needed when not dragging
        if (!activeId) return flattenedItems;

        // Only calculate collapsed items when dragging
        const collapsedIds = flattenedItems
            .filter((item) => item.collapsed && item.hasChildren)
            .map((item) => item.id);

        return removeChildrenOf(flattenedItems, [activeId, ...collapsedIds]);
    }, [activeId, flattenedItems]);

    // Get the full item data for the drag overlay - derived from activeId state
    // This pattern ensures the drag overlay updates reactively when activeId changes
    const activeItem = activeId ? flattenedItems.find((item) => item.id === activeId) : null;

    // Memoized sensors configuration
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    // Memoized measuring strategy
    const measuring = useMemo(
        () => ({
            droppable: {
                strategy: MeasuringStrategy.Always,
            },
        }),
        []
    );

    // Memoized collision detection
    const collisionDetectionStrategy = useCallback((args: Parameters<typeof closestCenter>[0]) => {
        // First, use pointer detection for better UX
        const pointerIntersections = pointerWithin(args);
        if (pointerIntersections.length > 0) {
            return pointerIntersections;
        }

        // Fallback to rectangle intersection
        const rectIntersections = rectIntersection(args);
        if (rectIntersections.length > 0) {
            return rectIntersections;
        }

        // Final fallback
        return closestCenter(args);
    }, []);

    // ====================
    // Handlers
    // ====================

    const handleDragStart = useCallback(({ active }: DragStartEvent) => {
        // Set the active item ID to the ID of the item being dragged
        setActiveId(active.id);
    }, []);

    /**
     * Handle drag over event. This is used to determine if the drag is over a valid drop target.
     *
     * If returns true, the drag will be allowed.
     * If returns false, the drag will be cancelled.
     * If returns null, the drag will be ignored.
     */
    const handleDragOver = useCallback(
        ({ active, over, collisions, activatorEvent }: DragOverEvent) => {
            console.log('Drag over:', { active, over, collisions, activatorEvent });

            // If no over item, or the active item is the same as the over item, return null to ignore the drag
            if (!over || active.id === over.id) return;

            // Validate drop target using original items (not filtered)
            const canDrop = canDropItem(active.id, over.id, items);

            if (!canDrop) {
                console.warn('Invalid drop target:', { active: active.id, over: over.id });
            }
        },
        [items]
    );

    /**
     * Handle drag end event. This is used to perform the move operation.
     *
     * If returns true, the move will be performed.
     * If returns false, the move will be cancelled.
     */
    const handleDragEnd = useCallback(
        ({ active, over }: DragEndEvent) => {
            // Always clear activeId first to show children again
            setActiveId(null);

            // If no valid drop target or dropping on self, exit early
            if (!over || active.id === over.id) return;

            const activeId = active.id;
            const overId = over.id;

            // todo Validate the move
            // if (!canDropItem(activeId, overId, optimisticState.items)) {
            //     console.warn('Invalid move operation');
            //     return;
            // }

            // Find items in unfiltered structure to handle hidden children
            const activeItem = flattenedItems.find((item) => item.id === activeId);
            const overItem = flattenedItems.find((item) => item.id === overId);

            if (!activeItem || !overItem) {
                console.error('Could not find active or over item');
                return;
            }

            // Debug logging
            console.log('Drag operation:', {
                activeId,
                overId,
                activeItem: {
                    id: activeItem.id,
                    parentId: activeItem.parentId,
                    index: activeItem.index,
                },
                overItem: { id: overItem.id, parentId: overItem.parentId, index: overItem.index },
            });

            // Perform the move
            const newItems = moveTreeItem(items, {
                activeId,
                overId,
                activeIndex: activeItem.index,
                overIndex: overItem.index,
                activeItem,
                overItem,
            });

            console.log('New items after move:', newItems);

            // Update state with transition
            startTransition(() => {
                // setItems(newItems);

                // Notify parent component
                onItemMove?.(newItems);
            });

            console.log('Move completed - activeId already cleared');
        },
        [items, flattenedItems, onItemMove]
    );

    /**
     * Handle drag cancel event. This is used to cancel the drag operation.
     */
    const handleDragCancel = useCallback(() => {
        // Clear the active item ID
        setActiveId(null);
    }, []);

    return (
        <div className={cn('w-full', className)}>
            <DndContext
                sensors={sensors}
                collisionDetection={collisionDetectionStrategy}
                measuring={measuring}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <SortableContext
                    items={flattenedItems.map((item) => ({ id: item.id }))}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex flex-col gap-2">
                        {flattenedAndFilteredItems.map((item) => (
                            <SortableItem key={item.id} item={item} />
                        ))}
                    </div>
                </SortableContext>

                {typeof window !== 'undefined' &&
                    createPortal(
                        <DragOverlay
                            dropAnimation={{
                                duration: 150,
                                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                            }}
                        >
                            {activeId && activeItem ? (
                                <div className="bg-white border border-gray-200 rounded-md shadow-lg opacity-90">
                                    <TreeItem
                                        item={activeItem}
                                        dragButton={
                                            <div className="w-4 h-4 bg-gray-400 rounded opacity-50" />
                                        }
                                        className="border-none"
                                    />
                                    {getChildCount(items, activeId) > 0 && (
                                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                            {getChildCount(items, activeId) + 1}
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </DragOverlay>,
                        document.body
                    )}
            </DndContext>
        </div>
    );
};
