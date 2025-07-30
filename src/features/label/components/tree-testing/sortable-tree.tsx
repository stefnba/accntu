import {
    Announcements,
    DndContext,
    DragEndEvent,
    DragMoveEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    DropAnimation,
    KeyboardSensor,
    MeasuringStrategy,
    Modifier,
    PointerSensor,
    UniqueIdentifier,
    closestCenter,
    defaultDropAnimation,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useEffect, useMemo, useRef, useState } from 'react';
// @ts-expect-error - React 19 types issue with react-dom import
import { createPortal } from 'react-dom';

import { CSS } from '@dnd-kit/utilities';
import { SortableTreeItem } from './components/tree-item/sortable';
import { sortableTreeKeyboardCoordinates } from './keyboard-coordinates';
import type { FlattenedItem, SensorContext, TreeItems } from './types';
import {
    buildTree,
    flattenTree,
    getChildCount,
    getProjection,
    removeChildrenOf,
    removeItem,
    setProperty,
} from './utils';

/**
 * Initial demo data for the sortable tree component.
 * Represents a hierarchical structure with nested items.
 * 
 * Purpose: Provides example data to demonstrate tree functionality
 * 
 * Optimization suggestions:
 * - Consider lazy loading for large datasets
 * - Use virtualization for trees with 1000+ items
 * - Implement data normalization for better performance
 */
const initialItems: TreeItems = [
    {
        id: 'Home',
        children: [],
    },
    {
        id: 'Collections',
        children: [
            { id: 'Spring', children: [] },
            { id: 'Summer', children: [] },
            { id: 'Fall', children: [] },
            { id: 'Winter', children: [] },
        ],
    },
    {
        id: 'About Us',
        children: [],
    },
    {
        id: 'My Account',
        children: [
            { id: 'Addresses', children: [] },
            { id: 'Order History', children: [] },
        ],
    },
];

/**
 * DndKit measuring configuration for optimized collision detection.
 * 
 * Purpose: Configures how droppable areas are measured during drag operations
 * - MeasuringStrategy.Always ensures accurate collision detection
 * 
 * Optimization suggestions:
 * - Use MeasuringStrategy.BeforeDragging for better performance on large trees
 * - Consider MeasuringStrategy.WhileDragging for dynamic layouts
 */
const measuring = {
    droppable: {
        strategy: MeasuringStrategy.Always,
    },
};

/**
 * Custom drop animation configuration for smooth visual feedback.
 * 
 * Purpose: Defines how items animate when dropped
 * - Creates fade-out effect with slight position offset
 * - Provides visual feedback for successful drops
 * 
 * Optimization suggestions:
 * - Use CSS transforms instead of keyframes for better performance
 * - Consider reducing animation duration for snappier feel
 * - Implement will-change CSS property for smooth animations
 */
const dropAnimationConfig: DropAnimation = {
    keyframes({ transform }) {
        return [
            { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
            {
                opacity: 0,
                transform: CSS.Transform.toString({
                    ...transform.final,
                    x: transform.final.x + 5,
                    y: transform.final.y + 5,
                }),
            },
        ];
    },
    easing: 'ease-out',
    sideEffects({ active }) {
        active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: defaultDropAnimation.duration,
            easing: defaultDropAnimation.easing,
        });
    },
};

interface Props {
    collapsible?: boolean;
    defaultItems?: TreeItems;
    indentationWidth?: number;
    indicator?: boolean;
    removable?: boolean;
}

/**
 * Main sortable tree component with drag-and-drop functionality.
 * 
 * Purpose: Provides a hierarchical tree structure that supports:
 * - Drag and drop reordering
 * - Nesting/un-nesting items
 * - Collapsing/expanding branches
 * - Keyboard navigation
 * - Item removal
 * 
 * Optimization suggestions:
 * - Implement virtualization for large datasets (react-window)
 * - Use React.memo for tree items to prevent unnecessary re-renders
 * - Consider using useCallback for event handlers
 * - Implement debouncing for rapid drag movements
 */
export function SortableTree({
    collapsible,
    defaultItems = initialItems,
    indicator = false,
    indentationWidth = 50,
    removable,
}: Props) {
    const [items, setItems] = useState(() => defaultItems);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
    const [offsetLeft, setOffsetLeft] = useState(0);
    const [currentPosition, setCurrentPosition] = useState<{
        parentId: UniqueIdentifier | null;
        overId: UniqueIdentifier;
    } | null>(null);

    /**
     * Flattens the tree structure and handles collapsed items.
     * 
     * Purpose: Converts hierarchical tree into flat array for DndKit
     * - Filters out children of collapsed items
     * - Excludes children of currently dragged item
     * 
     * Optimization suggestions:
     * - Cache flattened result with stable key
     * - Use WeakMap for collapsed items tracking
     * - Consider incremental updates instead of full recalculation
     */
    const flattenedItems = useMemo(() => {
        const flattenedTree = flattenTree(items);
        const collapsedItems = flattenedTree.reduce<string[]>(
            (acc, { children, collapsed, id }) =>
                collapsed && children.length ? [...acc, id] : acc,
            []
        );

        return removeChildrenOf(
            flattenedTree,
            activeId != null ? [activeId, ...collapsedItems] : collapsedItems
        );
    }, [activeId, items]);
    /**
     * Calculates the projected position and depth of dragged item.
     * 
     * Purpose: Determines where item will be placed when dropped
     * - Calculates new depth based on horizontal drag offset
     * - Finds appropriate parent based on position
     * 
     * Optimization suggestions:
     * - Throttle projection calculations during drag
     * - Pre-calculate valid drop zones
     * - Use requestAnimationFrame for smooth updates
     */
    const projected =
        activeId && overId
            ? getProjection(flattenedItems, activeId, overId, offsetLeft, indentationWidth)
            : null;
    /**
     * Context object for keyboard sensor coordination.
     * 
     * Purpose: Provides current state to keyboard navigation handler
     * - Shares flattened items array
     * - Provides current horizontal offset
     * 
     * Optimization suggestions:
     * - Use stable reference to avoid sensor recreation
     * - Consider using context API for deep component trees
     */
    const sensorContext: SensorContext = useRef({
        items: flattenedItems,
        offset: offsetLeft,
    });
    /**
     * Custom keyboard coordinate getter for tree navigation.
     * 
     * Purpose: Enables keyboard-based drag and drop operations
     * - Handles arrow key navigation
     * - Manages depth changes with left/right arrows
     * 
     * Optimization suggestions:
     * - Memoize coordinate getter creation
     * - Use useCallback to prevent recreation
     */
    const [coordinateGetter] = useState(() =>
        sortableTreeKeyboardCoordinates(sensorContext, indicator, indentationWidth)
    );
    /**
     * Configures input sensors for drag and drop operations.
     * 
     * Purpose: Enables mouse/touch and keyboard interactions
     * - PointerSensor for mouse/touch drag
     * - KeyboardSensor for accessibility
     * 
     * Optimization suggestions:
     * - Use activation constraints to prevent accidental drags
     * - Consider touch-specific sensors for mobile
     */
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter,
        })
    );

    /**
     * Extracts IDs from flattened items for SortableContext.
     * 
     * Purpose: Provides sorted array of IDs for DndKit context
     * 
     * Optimization suggestions:
     * - Use stable array reference when items don't change
     * - Consider using Set for O(1) lookup performance
     */
    const sortedIds = useMemo(() => flattenedItems.map(({ id }) => id), [flattenedItems]);
    /**
     * Finds the currently active (dragged) item.
     * 
     * Purpose: Provides item data for drag overlay rendering
     * 
     * Optimization suggestions:
     * - Use Map for O(1) item lookup instead of array.find
     * - Cache active item to avoid repeated searches
     */
    const activeItem = activeId ? flattenedItems.find(({ id }) => id === activeId) : null;

    useEffect(() => {
        sensorContext.current = {
            items: flattenedItems,
            offset: offsetLeft,
        };
    }, [flattenedItems, offsetLeft]);

    /**
     * Screen reader announcements for accessibility.
     * 
     * Purpose: Provides audio feedback for drag and drop operations
     * - Announces drag start/end events
     * - Describes movement and final position
     * 
     * Optimization suggestions:
     * - Debounce announcements to prevent spam
     * - Use more descriptive language for complex movements
     */
    const announcements: Announcements = {
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
    };

    return (
        <DndContext
            accessibility={{ announcements }}
            sensors={sensors}
            collisionDetection={closestCenter}
            measuring={measuring}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
                {flattenedItems.map(({ id, children, collapsed, depth }) => (
                    <SortableTreeItem
                        key={id}
                        id={id}
                        value={id}
                        depth={id === activeId && projected ? projected.depth : depth}
                        indentationWidth={indentationWidth}
                        indicator={indicator}
                        collapsed={Boolean(collapsed && children.length)}
                        onCollapse={
                            collapsible && children.length ? () => handleCollapse(id) : undefined
                        }
                        onRemove={removable ? () => handleRemove(id) : undefined}
                    />
                ))}
                {createPortal(
                    <DragOverlay
                        dropAnimation={dropAnimationConfig}
                        modifiers={indicator ? [adjustTranslate] : undefined}
                    >
                        {activeId && activeItem ? (
                            <SortableTreeItem
                                id={activeId}
                                depth={activeItem.depth}
                                clone
                                childCount={getChildCount(items, activeId) + 1}
                                value={activeId.toString()}
                                indentationWidth={indentationWidth}
                            />
                        ) : null}
                    </DragOverlay>,
                    document.body
                )}
            </SortableContext>
        </DndContext>
    );

    /**
     * Handles the start of a drag operation.
     * 
     * Purpose: Initializes drag state and visual feedback
     * - Sets active item ID
     * - Records initial position
     * - Changes cursor to grabbing
     * 
     * Optimization suggestions:
     * - Use useCallback to prevent function recreation
     * - Pre-calculate drag constraints
     * - Consider haptic feedback for touch devices
     */
    function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
        setActiveId(activeId);
        setOverId(activeId);

        const activeItem = flattenedItems.find(({ id }) => id === activeId);

        if (activeItem) {
            setCurrentPosition({
                parentId: activeItem.parentId,
                overId: activeId,
            });
        }

        document.body.style.setProperty('cursor', 'grabbing');
    }

    /**
     * Handles drag movement to update horizontal offset.
     * 
     * Purpose: Tracks horizontal movement for depth calculation
     * - Updates offset for nesting/un-nesting
     * - Triggers projection recalculation
     * 
     * Optimization suggestions:
     * - Throttle offset updates to reduce calculations
     * - Use requestAnimationFrame for smooth updates
     * - Consider snapping to indent levels
     */
    function handleDragMove({ delta }: DragMoveEvent) {
        setOffsetLeft(delta.x);
    }

    /**
     * Handles drag over events to track current drop target.
     * 
     * Purpose: Updates overId for projection calculations
     * - Tracks which item is being hovered
     * - Triggers visual feedback updates
     * 
     * Optimization suggestions:
     * - Debounce over events to reduce state updates
     * - Use native drag events for better performance
     */
    function handleDragOver({ over }: DragOverEvent) {
        setOverId(over?.id ?? null);
    }

    /**
     * Handles the end of a drag operation and commits changes.
     * 
     * Purpose: Finalizes the drag operation and updates tree structure
     * - Calculates final position and depth
     * - Rebuilds tree with new arrangement
     * - Resets drag state
     * 
     * Optimization suggestions:
     * - Use immutable updates for better performance
     * - Implement undo/redo functionality
     * - Batch multiple drag operations
     * - Consider using Immer for cleaner state updates
     */
    function handleDragEnd({ active, over }: DragEndEvent) {
        resetState();

        if (projected && over) {
            const { depth, parentId } = projected;
            const clonedItems: FlattenedItem[] = JSON.parse(JSON.stringify(flattenTree(items)));
            const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
            const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
            const activeTreeItem = clonedItems[activeIndex];

            clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

            const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
            const newItems = buildTree(sortedItems);

            setItems(newItems);
        }
    }

    /**
     * Handles drag cancellation (ESC key or invalid drop).
     * 
     * Purpose: Resets drag state without making changes
     * - Clears all drag-related state
     * - Restores original cursor
     * 
     * Optimization suggestions:
     * - Use useCallback for stable reference
     * - Consider animation for cancelled drags
     */
    function handleDragCancel() {
        resetState();
    }

    /**
     * Resets all drag-related state to initial values.
     * 
     * Purpose: Centralizes state cleanup after drag operations
     * - Clears active and over IDs
     * - Resets offset and position
     * - Restores cursor
     * 
     * Optimization suggestions:
     * - Use batch state updates
     * - Consider using reducer for complex state
     */
    function resetState() {
        setOverId(null);
        setActiveId(null);
        setOffsetLeft(0);
        setCurrentPosition(null);

        document.body.style.setProperty('cursor', '');
    }

    /**
     * Removes an item from the tree.
     * 
     * Purpose: Provides item deletion functionality
     * - Recursively removes item and its children
     * - Updates tree state
     * 
     * Optimization suggestions:
     * - Add confirmation dialog for safety
     * - Implement soft delete with undo
     * - Use optimistic updates for better UX
     */
    function handleRemove(id: UniqueIdentifier) {
        setItems((items) => removeItem(items, id));
    }

    /**
     * Toggles the collapsed state of a tree item.
     * 
     * Purpose: Manages expand/collapse functionality
     * - Toggles collapsed property
     * - Updates tree display
     * 
     * Optimization suggestions:
     * - Persist collapsed state in localStorage
     * - Use CSS transitions for smooth animations
     * - Consider lazy loading for collapsed children
     */
    function handleCollapse(id: UniqueIdentifier) {
        setItems((items) =>
            setProperty(items, id, 'collapsed', (value) => {
                return !value;
            })
        );
    }

    /**
     * Generates accessibility announcements for drag movements.
     * 
     * Purpose: Provides detailed audio feedback for screen readers
     * - Describes item movement relative to siblings
     * - Handles nesting level changes
     * - Provides contextual position information
     * 
     * Optimization suggestions:
     * - Cache announcement strings to avoid recalculation
     * - Use more natural language patterns
     * - Consider internationalization support
     */
    function getMovementAnnouncement(
        eventName: string,
        activeId: UniqueIdentifier,
        overId?: UniqueIdentifier
    ) {
        if (overId && projected) {
            if (eventName !== 'onDragEnd') {
                if (
                    currentPosition &&
                    projected.parentId === currentPosition.parentId &&
                    overId === currentPosition.overId
                ) {
                    return;
                } else {
                    setCurrentPosition({
                        parentId: projected.parentId,
                        overId,
                    });
                }
            }

            const clonedItems: FlattenedItem[] = JSON.parse(JSON.stringify(flattenTree(items)));
            const overIndex = clonedItems.findIndex(({ id }) => id === overId);
            const activeIndex = clonedItems.findIndex(({ id }) => id === activeId);
            const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

            const previousItem = sortedItems[overIndex - 1];

            let announcement;
            const movedVerb = eventName === 'onDragEnd' ? 'dropped' : 'moved';
            const nestedVerb = eventName === 'onDragEnd' ? 'dropped' : 'nested';

            if (!previousItem) {
                const nextItem = sortedItems[overIndex + 1];
                announcement = `${activeId} was ${movedVerb} before ${nextItem.id}.`;
            } else {
                if (projected.depth > previousItem.depth) {
                    announcement = `${activeId} was ${nestedVerb} under ${previousItem.id}.`;
                } else {
                    let previousSibling: FlattenedItem | undefined = previousItem;
                    while (previousSibling && projected.depth < previousSibling.depth) {
                        const parentId: UniqueIdentifier | null = previousSibling.parentId;
                        previousSibling = sortedItems.find(({ id }) => id === parentId);
                    }

                    if (previousSibling) {
                        announcement = `${activeId} was ${movedVerb} after ${previousSibling.id}.`;
                    }
                }
            }

            return announcement;
        }

        return;
    }
}

/**
 * Adjusts the drag overlay position for better visual alignment.
 * 
 * Purpose: Fine-tunes drag overlay positioning
 * - Offsets Y position to center on cursor
 * - Improves visual feedback during drag
 * 
 * Optimization suggestions:
 * - Use CSS transforms for hardware acceleration
 * - Consider dynamic offset based on item height
 */
const adjustTranslate: Modifier = ({ transform }) => {
    return {
        ...transform,
        y: transform.y - 25,
    };
};
