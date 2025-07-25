'use client';

import { TreeItem } from '@/features/label/components/tree-own/components/item';
import { SortableItem } from '@/features/label/components/tree-own/components/sortable-item';
import { useSortableTree } from '@/features/label/components/tree-own/hooks';
import {
    getChildCount,
    getDropProjection,
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
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useCallback, useMemo, useRef, useState } from 'react';
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

    // Refs for throttling
    const rafIdRef = useRef<number | null>(null);
    const lastMoveDataRef = useRef<{ delta: { x: number; y: number } } | null>(null);

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

    /**
     * Handle drag start event. This is used to set the active item ID and over item ID.
     */
    const handleDragStart = useCallback(({ active }: DragStartEvent) => {
        // Set the active item ID to the ID of the item being dragged
        setActiveId(active.id);
        // Set the over item ID to the ID of the item being dragged
        setOverId(active.id);
    }, []);

    /**
     * Handle drag move event. This is used to update the drop projection.
     * Uses requestAnimationFrame throttling to optimize performance.
     */
    const handleDragMove = useCallback(
        ({ delta }: DragMoveEvent) => {
            if (!activeId || !overId) return;

            // Store the latest move data
            lastMoveDataRef.current = { delta };

            // Cancel previous frame if it hasn't executed yet
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
            }

            // Schedule projection calculation for the next frame
            rafIdRef.current = requestAnimationFrame(() => {
                const moveData = lastMoveDataRef.current;
                if (!moveData || !activeId || !overId) return;

                const projection = getDropProjection({
                    items: flattenedItems,
                    activeId,
                    overId,
                    dragOffset: moveData.delta.x,
                });

                // If no projection, exit early
                if (!projection) return;

                // Only update if projection actually changed to avoid unnecessary re-renders
                setDropProjection((prev) => {
                    if (
                        !prev ||
                        prev.projectedItem.index !== projection.projectedItem.index ||
                        prev.projectedItem.depth !== projection.projectedItem.depth
                    ) {
                        console.log('projection', projection);
                        return projection;
                    }
                    return prev;
                });

                rafIdRef.current = null;
            });
        },
        [flattenedItems, activeId, overId]
    );

    /**
     * Handle drag over event. This is used to determine if the drag is over a valid drop target.
     * We can't use this to update drop projection, since it's only callled when the over item changes.
     *
     * If returns true, the drag will be allowed.
     * If returns false, the drag will be cancelled.
     * If returns null, the drag will be ignored.
     */
    const handleDragOver = useCallback(
        ({ active, over }: DragOverEvent) => {
            if (!over || !active) return;

            const newOverId = over?.id ?? null;

            // Only update if overId actually changed to prevent unnecessary re-renders
            setOverId((prev) => (prev !== newOverId ? newOverId : prev));
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

            const { projectedItem, activeItem, operation } = dropProjection;

            // move the item to the new position
            const newItems = arrayMove(flattenedItems, activeItem.index, projectedItem.index);

            // update the item in the new position
            newItems[projectedItem.index] = projectedItem;

            console.log('projectedItem', projectedItem);
            console.log('activeItem', activeItem);
            console.log('operation', operation);
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
        // Cancel any pending projection updates
        if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }

        // Clear the active item ID
        setActiveId(null);
        // Clear the drop projection
        setDropProjection(null);
        // Clear the over item ID
        setOverId(null);
    }, []);

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
                                    // If the active item is the same as the item, use the projected depth
                                    activeId === item.id
                                        ? (dropProjection?.projectedItem.depth ?? 0)
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
