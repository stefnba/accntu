import { FlattenedItem, FlattenedTreeItemBase } from '@/components/sortable-tree/types';
import { UniqueIdentifier } from '@dnd-kit/core';

/**
 * Gets the number of children for a given item from flattened data
 * @param items - The flattened items
 * @param id - The item ID
 * @returns Number of direct children
 */
export const getChildCount = <D extends FlattenedTreeItemBase>(
    items: FlattenedItem<D>[],
    id: UniqueIdentifier
): number => {
    const item = items.find(item => item.id === id);
    return item ? item.countChildren : 0;
};

/**
 * Removes children of specified parent IDs from flattened items
 * Used to hide children when their parent is being dragged
 * @param items - The flattened items
 * @param ids - Parent IDs whose children should be removed
 * @returns Filtered items without the children
 */
export const removeChildrenOf = <D extends FlattenedTreeItemBase>(
    items: FlattenedItem<D>[],
    ids: UniqueIdentifier[]
): FlattenedItem<D>[] => {
    const excludeParentIds = [...ids];

    return items.filter((item) => {
        if (item.parentId && excludeParentIds.includes(item.parentId)) {
            if (item.hasChildren) {
                excludeParentIds.push(item.id);
            }
            return false;
        }

        return true;
    });
};

/**
 * Checks if an item can be dropped on another item using flattened data
 * @param activeId - The item being dragged
 * @param overId - The item being dropped on
 * @param items - The flattened items
 * @returns Whether the drop is valid
 */
export const canDropItem = <D extends FlattenedTreeItemBase>(
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier,
    items: FlattenedItem<D>[]
): boolean => {
    if (activeId === overId) return false;

    const activeItem = items.find(item => item.id === activeId);
    const overItem = items.find(item => item.id === overId);
    
    if (!activeItem || !overItem) return false;

    // Create item map for parent lookups
    const itemMap = new Map<string, FlattenedItem<D>>();
    items.forEach(item => {
        itemMap.set(item.id as string, item);
    });

    // Check if trying to drop on a descendant (would create a cycle)
    // Walk up from overItem to see if we find activeItem as an ancestor
    let currentParentId = overItem.parentId;
    while (currentParentId) {
        if (currentParentId === activeId) {
            return false; // Would create a cycle
        }
        const parent = itemMap.get(currentParentId);
        currentParentId = parent?.parentId || null;
    }

    return true;
};
