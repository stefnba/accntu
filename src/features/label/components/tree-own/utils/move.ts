import { FlattenedItem } from '@/features/label/components/tree-own/types';
import { arrayMove } from '@dnd-kit/sortable';

/**
 * Moves a tree item from one index to another
 * @param items - The flattened items
 * @param activeIndex - The index of the active item
 * @param overIndex - The index of the over item
 * @returns The new flattened items
 */
export const moveTreeItem = (
    items: FlattenedItem[],
    activeIndex: number,
    overIndex: number
): FlattenedItem[] => {
    // Get the active tree item
    const activeItem = items[activeIndex];

    // Get the over tree item
    const overItem = items[overIndex];

    // Get the new parent
    const newParent = overItem.parent;

    // Update the active item with the new parent
    items[activeIndex] = {
        ...activeItem,
        parent: newParent,
        index: overIndex,
        depth: overItem.depth,
    };

    const newItems = arrayMove(items, activeIndex, overIndex);

    return newItems;
};
