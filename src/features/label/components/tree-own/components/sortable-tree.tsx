'use client';

import { TreeItem } from '@/features/label/components/tree-own/components/item';
import { SortableItem } from '@/features/label/components/tree-own/components/sortable-item';
import { useSortableTree } from '@/features/label/components/tree-own/hooks';
import {
    canDropItem,
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
    pointerWithin,
    rectIntersection,
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
    const { flattenedItems, items, handleMove } = useSortableTree();

    // Track the ID of the currently dragged item - useState is best practice here
    // as it's component-scoped state that triggers re-renders for the drag overlay
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    // Track the ID of the currently hovered item
    const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
    // Track the offset left of the currently dragged item, this is used to calculate the projected depth
    const [offsetLeft, setOffsetLeft] = useState<number>(0);

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

    // Get the drop projection for the drag overlay
    const dropProjection = getDropProjection({
        items: flattenedItems,
        activeId,
        overId,
        dragOffset: offsetLeft,
    });

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

    // Memoized collision detection
    const collisionDetectionStrategy = useCallback((args: Parameters<typeof closestCenter>[0]) => {
        // Final fallback
        return closestCenter(args);
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
    }, []);

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
            // Set the over item ID to the ID of the item being hovered
            setOverId(over?.id ?? null);

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

            // Validate the move
            if (!canDropItem(activeId, overId, items)) {
                console.warn('Invalid move operation');
                return;
            }

            // Simple intent - just insert after for now (you can enhance this later)
            // TODO: detect the intent based on the drop position
            const intent = { type: 'insert-after' as const, targetId: overId };

            // Perform the move using the hook's handleMove function
            handleMove(activeId, intent);
        },
        [items, handleMove]
    );

    /**
     * Handle drag cancel event. This is used to cancel the drag operation.
     */
    const handleDragCancel = useCallback(() => {
        // Clear the active item ID
        setActiveId(null);
    }, []);

    const handleDragMove = useCallback(({ delta }: DragMoveEvent) => {
        setOffsetLeft(delta.x);
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
                                        ? (dropProjection?.projectedDepth ?? 0)
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
