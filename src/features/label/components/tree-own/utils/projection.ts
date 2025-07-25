import { INDENTATION_WIDTH } from '@/features/label/components/tree-own/config';
import { FlattenedItem } from '@/features/label/components/tree-own/types';

import { UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export function getDropProjection({
    items,
    activeId,
    overId,
    dragOffset,
}: {
    items: FlattenedItem[];
    activeId: UniqueIdentifier | null;
    overId: UniqueIdentifier | null;
    dragOffset: number;
}) {
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
    const previousItem = newItems[overItemIndex - 1];

    // Get the item that would be right after the dropped item in the new position
    const nextItem = newItems[overItemIndex + 1];

    // Calculate how much the depth should change based on horizontal drag distance
    const dragDepth = getDragDepth(dragOffset, INDENTATION_WIDTH);

    // Calculate the new depth: original depth + change from horizontal dragging
    const projectedDepth = activeItem.depth + dragDepth;

    // Calculate the maximum allowed depth at this position (based on previous item
    const maxDepth = getMaxDepth({
        previousItem,
    });

    // Calculate the minimum allowed depth at this position (based on next item)
    const minDepth = getMinDepth({ nextItem });
    let depth = projectedDepth;

    // Clamp the depth to maximum allowed (can't nest deeper than rules allow)
    if (projectedDepth >= maxDepth) {
        depth = maxDepth;
    }
    // Clamp the depth to minimum allowed (can't promote higher than rules allow)
    else if (projectedDepth < minDepth) {
        depth = minDepth;
    }

    // Calculate who the new parent would be at this depth and position
    const newParentId = getParentIdForProjection({ depth, previousItem, newItems, overItemIndex });

    return {
        totalItems: newItems.length,
        current: {
            index: activeItemIndex,
            id: activeId,
            depth: activeItem.depth,
            parentId: activeItem.parent?.id ?? null,
        },
        projected: {
            index: overItemIndex,
            id: overId,
            depth,
            parentId: newParentId,
        },
        depth: {
            max: maxDepth,
            min: minDepth,
            current: activeItem.depth,
            projected: depth,
        },

        // parentId: newParentId,
        // previousId: previousItem?.id,
        // nextId: nextItem?.id,
        // oldIndex: activeItemIndex,
        // newIndex: newItems.findIndex(({ id }) => id === activeId),
    };
}

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
const getMaxDepth = ({ previousItem }: { previousItem: FlattenedItem }) => {
    if (previousItem) {
        return previousItem.depth + 1;
    }

    return 0;
};

const getMinDepth = ({ nextItem }: { nextItem: FlattenedItem }) => {
    if (nextItem) {
        return nextItem.depth;
    }

    return 0;
};

const getDragDepth = (offset: number, indentationWidth: number) =>
    Math.round(offset / indentationWidth);

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
