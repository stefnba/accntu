import { FlattenedItem } from '@/components/sortable-tree/types';

import { UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

type DropProjectionArgs = {
    items: FlattenedItem[];
    activeId: UniqueIdentifier | null;
    overId: UniqueIdentifier | null;
    dragOffset: number;
    indentationWidth: number;
};

/**
 * Get the projected depth for drag preview
 * @param items - The flattened items
 * @param activeId - The ID of the active item
 * @param overId - The ID of the over item
 * @param dragOffset - The drag offset
 * @returns The projected depth or null if invalid
 */
export function getProjectedDepth({
    items,
    activeId,
    overId,
    dragOffset,
    indentationWidth,
}: DropProjectionArgs): number | null {
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
    let projectedDepth = activeItem.depth + Math.round(dragOffset / indentationWidth);

    // Validate against min/max depth constraints
    const minDepth = getMinDepth({ nextItem });
    const maxDepth = getMaxDepth({ previousItem });

    // Clamp to valid range
    projectedDepth = Math.max(minDepth, Math.min(maxDepth, projectedDepth));

    return projectedDepth;
}

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