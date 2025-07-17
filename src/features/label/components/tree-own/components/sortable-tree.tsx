'use client';

import { SortableItem } from '@/features/label/components/tree-own/components/sortable-item';
import { useSortableTree } from '@/features/label/components/tree-own/hooks';
import { TreeItem } from '@/features/label/components/tree-own/types';
import { moveTreeItem } from '@/features/label/components/tree-own/utils';
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    MeasuringStrategy,
    MouseSensor,
    pointerWithin,
    rectIntersection,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { startTransition, useCallback, useEffect, useMemo } from 'react';

interface SortableTreeProps {
    defaultItems: TreeItem[];
    onItemMove?: (items: TreeItem[]) => void;
    onItemToggle?: (itemId: string, collapsed: boolean) => void;
    className?: string;
}

export const SortableTreeOwn = ({
    defaultItems,
    onItemMove,

    className,
}: SortableTreeProps) => {
    const { flattenedItems, sortableIds, items, setItems } = useSortableTree();

    useEffect(() => {
        setItems(defaultItems);
    }, [defaultItems, setItems]);

    // Optimistic updates for better UX
    // const [optimisticState, setOptimisticState] = useOptimistic(
    //     treeState,
    //     (state, newItems: TreeItem[]) => ({
    //         ...state,
    //         items: newItems,
    //         flattenedItems: flattenTree(newItems, state.collapsedItems),
    //     })
    // );

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
    const collisionDetectionStrategy = useCallback((args: any) => {
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

    // Handlers
    const handleDragStart = useCallback(({ active }: DragStartEvent) => {
        // Optional: Add visual feedback or analytics
        console.log('Drag started:', active.id);
    }, []);

    const handleDragOver = useCallback(
        ({ active, over }: DragOverEvent) => {
            return;
            // if (!over || active.id === over.id) return;

            // // Validate drop target
            // const canDrop = canDropItem(active.id, over.id, optimisticState.items);

            // if (!canDrop) {
            //     console.warn('Invalid drop target:', { active: active.id, over: over.id });
            // }
        },
        [items]
    );

    const handleDragEnd = useCallback(
        ({ active, over }: DragEndEvent) => {
            if (!over || active.id === over.id) return;

            const activeId = active.id as string;
            const overId = over.id as string;

            // todo Validate the move
            // if (!canDropItem(activeId, overId, optimisticState.items)) {
            //     console.warn('Invalid move operation');
            //     return;
            // }

            // Find items in flattened structure
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
                setItems(newItems);

                // Notify parent component
                onItemMove?.(newItems);
            });
        },
        [items, flattenedItems, onItemMove]
    );

    // const handleToggleCollapse = useCallback(
    //     (itemId: string) => {
    //         const newCollapsedItems = new Set(treeState.collapsedItems);

    //         if (newCollapsedItems.has(itemId)) {
    //             newCollapsedItems.delete(itemId);
    //         } else {
    //             newCollapsedItems.add(itemId);
    //         }

    //         startTransition(() => {
    //             const newTreeState = {
    //                 ...treeState,
    //                 collapsedItems: newCollapsedItems,
    //                 flattenedItems: flattenTree(treeState.items, newCollapsedItems),
    //             };

    //             setTreeState(newTreeState);

    //             // Notify parent component
    //             onItemToggle?.(itemId, newCollapsedItems.has(itemId));
    //         });
    //     },
    //     [treeState, onItemToggle]
    // );

    const handleDragCancel = useCallback(() => {
        console.log('Drag cancelled');
    }, []);

    return (
        <div className={className}>
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
                    items={Array.from(sortableIds).map((id) => ({ id }))}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {flattenedItems.map((item) => (
                            <SortableItem key={item.id} item={item} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};
