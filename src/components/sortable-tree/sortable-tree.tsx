'use client';

import { SortableTreeOptions, useSortableTree } from '@/components/sortable-tree/hooks';
import { SortableItem } from '@/components/sortable-tree/sortable-item';
import { FlattenedItem, TreeItem } from '@/components/sortable-tree/types';
import {
    getChildCount,
    getProjectedDepth,
    removeChildrenOf,
} from '@/components/sortable-tree/utils';
import { performMove } from '@/components/sortable-tree/utils/move';
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
import { useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface SortableTreeProps<T extends TreeItem> {
    options: SortableTreeOptions<T>;
    children: (item: FlattenedItem<T>, dragButton: React.ReactNode) => React.ReactNode;
    className?: string;
}

export const SortableTree = <T extends TreeItem>({
    options,
    children,
    className,
}: SortableTreeProps<T>) => {
    const { flattenedItems, items, handleOptimisticMove, toggleExpandedId, indentationWidth } =
        useSortableTree(options);

    // Track the ID of the currently dragged item - useState is best practice here
    // as it's component-scoped state that triggers re-renders for the drag overlay
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    // Track the ID of the currently hovered item
    const [overId, setOverId] = useState<UniqueIdentifier | null>(null);

    // Track only the projected depth for lightweight drag preview
    const [projectedDepth, setProjectedDepth] = useState<number | null>(null);

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

            // Schedule lightweight depth calculation for the next frame
            rafIdRef.current = requestAnimationFrame(() => {
                const moveData = lastMoveDataRef.current;
                if (!moveData || !activeId || !overId) return;

                const newProjectedDepth = getProjectedDepth({
                    items: flattenedItems,
                    activeId,
                    overId,
                    dragOffset: moveData.delta.x,
                    indentationWidth,
                });

                // Only update if depth actually changed to avoid unnecessary re-renders
                setProjectedDepth((prev) => {
                    if (prev !== newProjectedDepth) {
                        return newProjectedDepth;
                    }
                    return prev;
                });

                rafIdRef.current = null;
            });
        },
        [flattenedItems, activeId, overId, indentationWidth]
    );

    /**
     * Handle drag over event. This is used to determine if the drag is over a valid drop target.
     * We can't use this to update drop projection, since it's only callled when the over item changes.
     *
     * If returns true, the drag will be allowed.
     * If returns false, the drag will be cancelled.
     * If returns null, the drag will be ignored.
     */
    const handleDragOver = useCallback(({ active, over }: DragOverEvent) => {
        if (!over || !active) return;

        const newOverId = over?.id ?? null;

        // Only update if overId actually changed to prevent unnecessary re-renders
        setOverId((prev) => (prev !== newOverId ? newOverId : prev));
    }, []);

    /**
     * Handle drag end event. This is used to perform the move operation.
     *
     * If returns true, the move will be performed.
     * If returns false, the move will be cancelled.
     */
    const handleDragEnd = useCallback(
        ({ active, over }: DragEndEvent) => {
            // Always clear state first
            setActiveId(null);
            setOverId(null);
            const currentProjectedDepth = projectedDepth;
            setProjectedDepth(null);

            // If no valid drop target or dropping on self, exit early
            if (!over || !active || currentProjectedDepth === null) return;

            // Perform the heavy calculation once on drop
            const moveResult = performMove(
                active.id,
                over.id,
                currentProjectedDepth,
                flattenedItems,
                toggleExpandedId
            );

            if (!moveResult) {
                console.warn('Move operation failed');
                return;
            }

            console.log('Move operation:', moveResult.operation);
            console.log('Changes:', moveResult.changes);
            console.log('New items:', moveResult.items);

            // Perform the move using the hook's handleMove function
            handleOptimisticMove(moveResult.items);
        },
        [flattenedItems, handleOptimisticMove, projectedDepth, toggleExpandedId]
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
        // Clear the projected depth
        setProjectedDepth(null);
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
                                    activeId === item.id && projectedDepth !== null
                                        ? projectedDepth
                                        : item.depth
                                }
                                key={item.id}
                                item={item}
                                indentationWidth={indentationWidth}
                            >
                                {children}
                            </SortableItem>
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
                                    {children(
                                        activeItem,
                                        <div className="w-4 h-4 bg-gray-400 rounded opacity-50" />
                                    )}
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
