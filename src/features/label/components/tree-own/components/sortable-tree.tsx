'use client';

import { TreeItem } from '@/features/label/components/tree-own/components/item';
import { SortableItem } from '@/features/label/components/tree-own/components/sortable-item';
import { useSortableTree } from '@/features/label/components/tree-own/hooks';
import {
    canDropItem,
    getChildCount,
    getDropProjection,
    moveTreeItem,
    removeChildrenOf,
} from '@/features/label/components/tree-own/utils';
import { cn } from '@/lib/utils';
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragMoveEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    MeasuringStrategy,
    MouseSensor,
    TouchSensor,
    UniqueIdentifier,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

interface SortableTreeProps {
    className?: string;
}

export const SortableTreeOwn = ({ className }: SortableTreeProps) => {
    const { flattenedItems, items, handleOptimisticMove } = useSortableTree();

    // Track the ID of the currently dragged item - useState is best practice here
    // as it's component-scoped state that triggers re-renders for the drag overlay
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    // Track the ID of the currently hovered item
    const [overId, setOverId] = useState<UniqueIdentifier | null>(null);

    // Track the drop projection for the drag overlay
    const [dropProjection, setDropProjection] = useState<ReturnType<
        typeof getDropProjection
    > | null>(null);

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

    // Memoize child count to avoid double calculation in drag overlay
    const activeItemChildCount = useMemo(
        () => (activeId ? getChildCount(items, activeId) : 0),
        [activeId, items]
    );

    // Memoize SortableContext items to prevent unnecessary re-renders
    const sortableContextItems = useMemo(
        () => flattenedItems.map((item) => ({ id: item.id })),
        [flattenedItems]
    );

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

    // ====================
    // Handlers
    // ====================

    const handleDragStart = useCallback(({ active }: DragStartEvent) => {
        // Set the active item ID to the ID of the item being dragged
        setActiveId(active.id);
        // Set the over item ID to the ID of the item being dragged
        setOverId(active.id);
    }, []);

    /**
     * Handle drag over event. This is used to determine if the drag is over a valid drop target.
     *
     * If returns true, the drag will be allowed.
     * If returns false, the drag will be cancelled.
     * If returns null, the drag will be ignored.
     */
    const handleDragOver = useCallback(
        ({ active, over }: DragOverEvent) => {
            const newOverId = over?.id ?? null;
            
            // Only update if overId actually changed to prevent unnecessary re-renders
            setOverId(prev => prev !== newOverId ? newOverId : prev);

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
            setOverId(null);

            // If no valid drop target or dropping on self, exit early
            if (!over || !active || !dropProjection) return;

            const activeId = active.id;
            const overId = over.id;

            // Validate the move
            if (!canDropItem(activeId, overId, items)) {
                console.warn('Invalid move operation');
                return;
            }

            const { projected, current } = dropProjection;

            const clonedItems = flattenedItems;

            const activeIndex = current.index;
            const overIndex = projected.index;

            const newItems = moveTreeItem(clonedItems, activeIndex, overIndex);

            // // Get the active tree item
            // const activeTreeItem = clonedItems[activeIndex];

            // // Update the active tree item with the new projected values
            // const newParent = projected.parentId
            //     ? clonedItems.find(item => item.id === projected.parentId)
            //     : null;

            // clonedItems[activeIndex] = {
            //     ...activeTreeItem,
            //     index: overIndex,
            //     parent: newParent ? { id: newParent.id, index: newParent.index, depth: newParent.depth } : null,
            //     depth: projected.depth,
            // };

            // const newItems = arrayMove(clonedItems, activeIndex, overIndex);

            console.log('dropProjection', dropProjection);
            console.log('newItems', newItems);

            // Perform the move using the hook's handleMove function
            handleOptimisticMove(newItems);
        },
        [items, handleOptimisticMove]
    );

    /**
     * Handle drag cancel event. This is used to cancel the drag operation.
     */
    const handleDragCancel = useCallback(() => {
        // Clear the active item ID
        setActiveId(null);
        // Clear the drop projection
        setDropProjection(null);
        // Clear the over item ID
        setOverId(null);
    }, []);

    const handleDragMove = useCallback(
        ({ delta }: DragMoveEvent) => {
            if (!activeId || !overId || activeId === overId) return;

            // Throttle projection updates to reduce flickering
            const projection = getDropProjection({
                items: flattenedItems,
                activeId,
                overId,
                dragOffset: delta.x,
            });
            
            if (projection) {
                // Only update if projection actually changed to avoid unnecessary re-renders
                setDropProjection(prev => {
                    if (!prev || 
                        prev.projected.index !== projection.projected.index ||
                        prev.projected.depth !== projection.projected.depth) {
                        return projection;
                    }
                    return prev;
                });
            }
        },
        [flattenedItems, activeId, overId]
    );

    return (
        <div className={cn('w-full', className)}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                measuring={measuring}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragMove={handleDragMove}
                onDragCancel={handleDragCancel}
            >
                <SortableContext
                    items={sortableContextItems}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex flex-col gap-2">
                        {flattenedAndFilteredItems.map((item) => (
                            <SortableItem
                                depth={
                                    activeId === item.id
                                        ? (dropProjection?.depth.projected ?? 0)
                                        : item.depth
                                }
                                key={item.id}
                                item={item}
                            />
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
                                    {activeItemChildCount > 0 && (
                                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                            {activeItemChildCount + 1}
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
