import { INDENTATION_WIDTH } from '@/features/label/components/tree-own/config';
import { FlattenedItem } from '@/features/label/components/tree-own/types';

import { UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

type DropProjectionArgs = {
    items: FlattenedItem[];
    activeId: UniqueIdentifier | null;
    overId: UniqueIdentifier | null;
    dragOffset: number;
};

type TDropOperation = {
    type: 'insert-before' | 'insert-after' | 'nest-under';
    targetId: UniqueIdentifier;
    activeId: UniqueIdentifier;
};

type DropProjectionReturn = null | {
    operation: TDropOperation;
    totalItems: number;
    activeItem: FlattenedItem;
    projectedItem: FlattenedItem;
};

/**
 * Gets the drop projection for a given item
 * @param items - The flattened items
 * @param activeId - The ID of the active item
 * @param overId - The ID of the over item
 * @param dragOffset - The drag offset
 * @returns The drop projection
 */
export function getDropProjection({
    items,
    activeId,
    overId,
    dragOffset,
}: DropProjectionArgs): DropProjectionReturn {
    // If no active or over item, exit early
    if (!activeId || !overId) {
        return null;
    }

    // Find where the target item (being dropped on) is in the flattened list
    const overItemIndex = items.findIndex(({ id }) => id === overId);

    // Find where the dragged item currently is in the flat list
    const activeItemIndex = items.findIndex(({ id }) => id === activeId);

    // Get the full data of the item being dragged
    const activeItem = items[activeItemIndex];

    // Simulate moving the active item to the over item's position (temporary array)
    const newItems = arrayMove(items, activeItemIndex, overItemIndex);

    // Get the item that would be right before the dropped item in the new position
    const previousItem = newItems[overItemIndex - 1] || null;

    // Get the item that would be right after the dropped item in the new position
    const nextItem = newItems[overItemIndex + 1] || null;

    // Calculate the new depth: original depth + change from horizontal dragging
    let projectedDepth = activeItem.depth + Math.round(dragOffset / INDENTATION_WIDTH);

    // clamp to the minimum depth
    if (projectedDepth < getMinDepth({ nextItem })) {
        const minDepth = getMinDepth({ nextItem });
        console.log('minDepth', minDepth);
        projectedDepth = minDepth;
    }

    // clamp to the maximum depth
    if (projectedDepth > getMaxDepth({ previousItem })) {
        const maxDepth = getMaxDepth({ previousItem });
        console.log('maxDepth', maxDepth);
        projectedDepth = maxDepth;
    }

    // build return value with field that are the same for all cases
    const returnValue = {
        totalItems: newItems.length,
        activeItem,
    };

    // insert after
    if (previousItem) {
        const newCurrentDepthIndex = previousItem.currentDepthIndex + 1;
        const newParent = previousItem.parent;

        // need to find parent item of previous item
        if (projectedDepth < previousItem.depth) {
            console.log('need to find parent item of previous item');
        }

        // nesting under previous item
        // todo check if has no existing children
        if (projectedDepth > previousItem.depth) {
            const newParent = previousItem;
            let newCurrentDepthIndex = 0;

            if (previousItem.hasChildren) {
                newCurrentDepthIndex = previousItem.childrenCount;
            }

            return {
                ...returnValue,
                operation: {
                    type: 'nest-under',
                    targetId: previousItem.id,
                    activeId,
                },
                projectedItem: {
                    ...activeItem,
                    index: overItemIndex,
                    currentDepthIndex: newCurrentDepthIndex,
                    depth: projectedDepth,
                    parent: newParent,
                },
            };
        }

        return {
            ...returnValue,
            operation: {
                type: 'insert-after',
                targetId: overId,
                activeId,
            },
            projectedItem: {
                ...activeItem,
                index: overItemIndex,

                currentDepthIndex: newCurrentDepthIndex,
                depth: projectedDepth,
                parent: newParent,
            },
        };
    }

    // first item in the list
    if (nextItem) {
        return {
            ...returnValue,
            operation: {
                type: 'insert-before',
                targetId: overId,
                activeId,
            },
            projectedItem: {
                ...activeItem,
                index: 0,
                currentDepthIndex: 0,
                depth: 0,
                parent: null,
            },
        };
    }

    return null;
}

/**
 * Gets the parent ID for a given depth
 * @param depth - The depth
 * @param previousItem - The previous item
 * @param newItems - The new items
 * @param overItemIndex - The index of the over item
 * @returns The parent ID
 */
const getParentIdForProjection = ({
    depth,
    previousItem,
    newItems,
    overItemIndex,
}: {
    depth: number;
    previousItem: FlattenedItem;
    newItems: FlattenedItem[];
    overItemIndex: number;
}) => {
    if (depth === 0 || !previousItem) {
        return null;
    }

    if (depth === previousItem.depth) {
        return previousItem.parent?.id ?? null;
    }

    if (depth > previousItem.depth) {
        return previousItem.id;
    }

    const newParent = newItems
        .slice(0, overItemIndex)
        .reverse()
        .find((item) => item.depth === depth)?.parent?.id;

    return newParent ?? null;
};

/**
 * Gets the maximum depth for a given item
 * @param previousItem - The previous item
 * @returns The maximum depth
 */
const getMaxDepth = ({ previousItem }: { previousItem: FlattenedItem }) => {
    if (previousItem) {
        return previousItem.depth + 1;
    }

    return 0;
};

/**
 * Gets the minimum depth for a given item
 * @param nextItem - The next item
 * @returns The minimum depth
 */
const getMinDepth = ({ nextItem }: { nextItem: FlattenedItem }) => {
    if (nextItem) {
        return nextItem.depth;
    }

    return 0;
};

type MoveIntentType = 'insert-before' | 'insert-after' | 'nest-under';
type MoveIntentReturn = {
    type: MoveIntentType;
    targetId: UniqueIdentifier;
    parentId: UniqueIdentifier;
    index: number;
};

export const getMoveIntent = (): MoveIntentReturn => {
    return {
        type: 'insert-after',
        targetId: '1',
        parentId: '2',
        index: 0,
    };
};

const calculateDepth = (activeItemDepth: number, dragOffset: number) => {
    return activeItemDepth + Math.round(dragOffset / INDENTATION_WIDTH);
};
