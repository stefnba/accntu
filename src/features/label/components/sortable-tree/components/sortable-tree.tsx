import React, { 
    useCallback, 
    useEffect, 
    useMemo, 
    useRef, 
    useState,
    useDeferredValue,
    useTransition,
    type Modifier 
} from 'react';
import {
    DndContext,
    DragEndEvent,
    DragMoveEvent,
    DragOverEvent,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    DragOverlay,
    type Announcements,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';

import { SortableTreeItem } from './sortable-tree-item';
import { TreeItem } from './tree-item';
import { 
    useTreeStore, 
    useFlattenedItems,
    useActiveId,
    useOverId,
    useOffsetLeft,
    useCurrentPosition,
    useActiveItem,
    useSortedIds,
    useInitializeTree,
    useStartDrag,
    useMoveDrag,
    useOverDrag,
    useEndDrag,
    useCancelDrag,
    useRemoveItem,
    useToggleCollapse
} from '../store/tree-store';
import { createKeyboardCoordinateGetter } from '../utils/keyboard-coordinates';
import { getProjection, buildTree, flattenTree, getChildCount, cloneItems } from '../utils/tree-utils';
import { 
    DEFAULT_ITEMS, 
    DEFAULT_INDENTATION_WIDTH, 
    MEASURING_CONFIG, 
    DROP_ANIMATION_CONFIG 
} from '../utils/constants';
import type { SortableTreeProps, SensorContext } from '../types';

const adjustTranslate: Modifier = ({ transform }) => ({
    ...transform,
    y: transform.y - 25,
});

export const SortableTree = React.memo<SortableTreeProps>(({
    collapsible = false,
    defaultItems = DEFAULT_ITEMS,
    indicator = false,
    indentationWidth = DEFAULT_INDENTATION_WIDTH,
    removable = false,
    onItemsChange,
}) => {
    const [isPending, startTransition] = useTransition();
    
    // Zustand store hooks
    const flattenedItems = useFlattenedItems();
    const activeId = useActiveId();
    const overId = useOverId();
    const offsetLeft = useOffsetLeft();
    const currentPosition = useCurrentPosition();
    const activeItem = useActiveItem();
    const sortedIds = useSortedIds();
    
    // Individual action hooks to prevent object recreation
    const initializeTree = useInitializeTree();
    const startDrag = useStartDrag();
    const moveDrag = useMoveDrag();
    const overDrag = useOverDrag();
    const endDrag = useEndDrag();
    const cancelDrag = useCancelDrag();
    const removeItem = useRemoveItem();
    const toggleCollapse = useToggleCollapse();

    // Defer expensive values during drag operations
    const deferredActiveId = useDeferredValue(activeId);
    const deferredFlattenedItems = useDeferredValue(flattenedItems);

    // Initialize tree on mount
    useEffect(() => {
        initializeTree(defaultItems);
    }, [defaultItems, initializeTree]);

    // Sensor context for keyboard navigation
    const sensorContext = useRef<SensorContext['current']>({
        items: flattenedItems,
        offset: offsetLeft,
    });

    // Update sensor context when items or offset change
    useEffect(() => {
        sensorContext.current = {
            items: flattenedItems,
            offset: offsetLeft,
        };
    }, [flattenedItems, offsetLeft]);

    // Memoized coordinate getter for keyboard navigation
    const coordinateGetter = useMemo(
        () => createKeyboardCoordinateGetter(
            { current: sensorContext.current }, 
            indicator, 
            indentationWidth
        ),
        [indicator, indentationWidth]
    );

    // Sensors configuration
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter,
        })
    );

    // Memoized projection calculation
    const projected = useMemo(() => {
        if (!activeId || !overId) return null;
        return getProjection(
            deferredFlattenedItems, 
            activeId, 
            overId, 
            offsetLeft, 
            indentationWidth
        );
    }, [deferredFlattenedItems, activeId, overId, offsetLeft, indentationWidth]);

    // Drag handlers
    const handleDragStart = useCallback(({ active: { id: activeId } }: DragStartEvent) => {
        const activeItem = flattenedItems.find(({ id }) => id === activeId);
        const currentPosition = activeItem ? {
            parentId: activeItem.parentId,
            overId: activeId,
        } : null;

        startDrag(activeId, currentPosition);
        
        // Set cursor style
        document.body.style.setProperty('cursor', 'grabbing');
    }, [flattenedItems, startDrag]);

    const handleDragMove = useCallback(({ delta }: DragMoveEvent) => {
        moveDrag(delta.x);
    }, [moveDrag]);

    const handleDragOver = useCallback(({ over }: DragOverEvent) => {
        overDrag(over?.id ?? null);
    }, [overDrag]);

    const handleDragEnd = useCallback(({ active, over }: DragEndEvent) => {
        // Reset cursor
        document.body.style.setProperty('cursor', '');
        
        if (projected && over) {
            const { depth, parentId } = projected;
            
            // Use transition for non-urgent updates
            startTransition(() => {
                const clonedItems = cloneItems(flattenTree(useTreeStore.getState().items));
                const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
                const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
                const activeTreeItem = clonedItems[activeIndex];

                clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };
                const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
                const newItems = buildTree(sortedItems);

                endDrag(newItems);
                onItemsChange?.(newItems);
            });
        } else {
            cancelDrag();
        }
    }, [projected, endDrag, cancelDrag, onItemsChange]);

    const handleDragCancel = useCallback(() => {
        document.body.style.setProperty('cursor', '');
        cancelDrag();
    }, [cancelDrag]);

    // Item action handlers
    const handleRemove = useCallback((id: string) => {
        removeItem(id);
    }, [removeItem]);

    const handleCollapse = useCallback((id: string) => {
        toggleCollapse(id);
    }, [toggleCollapse]);

    // Announcements for accessibility
    const announcements = useMemo((): Announcements => ({
        onDragStart({ active }) {
            return `Picked up ${active.id}.`;
        },
        onDragMove({ active, over }) {
            return getMovementAnnouncement('onDragMove', active.id, over?.id);
        },
        onDragOver({ active, over }) {
            return getMovementAnnouncement('onDragOver', active.id, over?.id);
        },
        onDragEnd({ active, over }) {
            return getMovementAnnouncement('onDragEnd', active.id, over?.id);
        },
        onDragCancel({ active }) {
            return `Moving was cancelled. ${active.id} was dropped in its original position.`;
        },
    }), [flattenedItems, projected, currentPosition]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            document.body.style.removeProperty('cursor');
        };
    }, []);

    return (
        <DndContext
            accessibility={{ announcements }}
            sensors={sensors}
            collisionDetection={closestCenter}
            measuring={MEASURING_CONFIG}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
                {deferredFlattenedItems.map(({ id, children, collapsed, depth }) => (
                    <SortableTreeItem
                        key={id}
                        id={id}
                        value={String(id)}
                        depth={id === deferredActiveId && projected ? projected.depth : depth}
                        indentationWidth={indentationWidth}
                        indicator={indicator}
                        collapsed={Boolean(collapsed && children.length)}
                        onCollapse={
                            collapsible && children.length 
                                ? () => handleCollapse(String(id)) 
                                : undefined
                        }
                        onRemove={
                            removable 
                                ? () => handleRemove(String(id)) 
                                : undefined
                        }
                    />
                ))}
                
                {createPortal(
                    <DragOverlay
                        dropAnimation={DROP_ANIMATION_CONFIG}
                        modifiers={indicator ? [adjustTranslate] : undefined}
                    >
                        {activeId && activeItem ? (
                            <TreeItem
                                id={activeId}
                                value={String(activeId)}
                                depth={activeItem.depth}
                                clone
                                childCount={getChildCount(useTreeStore.getState().items, activeId) + 1}
                                indentationWidth={indentationWidth}
                            />
                        ) : null}
                    </DragOverlay>,
                    document.body
                )}
            </SortableContext>
        </DndContext>
    );

    function getMovementAnnouncement(
        eventName: string,
        activeId: string,
        overId?: string
    ): string | undefined {
        if (overId && projected) {
            if (eventName !== 'onDragEnd') {
                if (
                    currentPosition &&
                    projected.parentId === currentPosition.parentId &&
                    overId === currentPosition.overId
                ) {
                    return;
                } else {
                    useTreeStore.getState().startDrag(activeId, {
                        parentId: projected.parentId,
                        overId,
                    });
                }
            }

            const items = useTreeStore.getState().items;
            const clonedItems = cloneItems(flattenTree(items));
            const overIndex = clonedItems.findIndex(({ id }) => id === overId);
            const activeIndex = clonedItems.findIndex(({ id }) => id === activeId);
            const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
            const previousItem = sortedItems[overIndex - 1];

            const movedVerb = eventName === 'onDragEnd' ? 'dropped' : 'moved';
            const nestedVerb = eventName === 'onDragEnd' ? 'dropped' : 'nested';

            if (!previousItem) {
                const nextItem = sortedItems[overIndex + 1];
                return `${activeId} was ${movedVerb} before ${nextItem.id}.`;
            } else {
                if (projected.depth > previousItem.depth) {
                    return `${activeId} was ${nestedVerb} under ${previousItem.id}.`;
                } else {
                    let previousSibling = previousItem;
                    while (previousSibling && projected.depth < previousSibling.depth) {
                        const parentId = previousSibling.parentId;
                        previousSibling = sortedItems.find(({ id }) => id === parentId);
                    }

                    if (previousSibling) {
                        return `${activeId} was ${movedVerb} after ${previousSibling.id}.`;
                    }
                }
            }
        }

        return;
    }
});

SortableTree.displayName = 'SortableTree';