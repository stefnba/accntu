import {
    FlattenedItem,
    TreeItem,
    TreeMoveOperation,
} from '@/features/label/components/tree-own/types';
import { UniqueIdentifier } from '@dnd-kit/core';

/**
 * Flattens a tree structure into a linear array with hierarchy information
 * @param items - The tree items to flatten
 * @param collapsedItems - Set of collapsed item IDs
 * @param parentId - The parent ID for the current level
 * @param depth - The current depth level
 * @returns A flat array of items with depth and parent information
 */
const flatten = (
    items: TreeItem[],
    collapsedItems: Set<UniqueIdentifier> = new Set(),
    parentId: UniqueIdentifier | null = null,
    depth = 0
): FlattenedItem[] => {
    return items.reduce<FlattenedItem[]>((acc, item, index) => {
        const flattenedItem: FlattenedItem = {
            ...item,
            parentId,
            depth,
            index,
            collapsed: collapsedItems.has(item.id),
            childrenCount: item.children.length,
            hasChildren: item.children.length > 0,
        };

        acc.push(flattenedItem);

        // Only flatten children if item is not collapsed
        if (item.children.length > 0 && !collapsedItems.has(item.id)) {
            acc.push(...flatten(item.children, collapsedItems, item.id, depth + 1));
        }

        return acc;
    }, []);
};

/**
 * Public API for flattening a tree structure
 * @param items - The tree items to flatten
 * @param collapsedItems - Set of collapsed item IDs
 * @returns A flat array of items with hierarchy information
 */
export const flattenTree = (
    items: TreeItem[],
    collapsedItems: Set<UniqueIdentifier> = new Set()
): FlattenedItem[] => flatten(items, collapsedItems);

/**
 * Finds an item in the tree by ID
 * @param items - The tree items to search
 * @param id - The ID to search for
 * @returns The found item or null
 */
export const findTreeItem = (items: TreeItem[], id: UniqueIdentifier): TreeItem | null => {
    for (const item of items) {
        if (item.id === id) return item;
        const found = findTreeItem(item.children, id);
        if (found) return found;
    }
    return null;
};

/**
 * Removes an item from the tree by ID
 * @param items - The tree items
 * @param id - The ID to remove
 * @returns New tree without the item
 */
export const removeTreeItem = (items: TreeItem[], id: UniqueIdentifier): TreeItem[] => {
    return items.reduce<TreeItem[]>((acc, item) => {
        if (item.id === id) return acc;

        return [
            ...acc,
            {
                ...item,
                children: removeTreeItem(item.children, id),
            },
        ];
    }, []);
};

/**
 * Moves an item within the tree structure
 * @param items - The tree items
 * @param operation - The move operation details
 * @returns New tree with the item moved
 */
export const moveTreeItem = (items: TreeItem[], operation: TreeMoveOperation): TreeItem[] => {
    const { activeId, activeItem, overItem } = operation;

    // Remove the active item from its current position
    const itemsWithoutActive = removeTreeItem(items, activeId);

    // Find the item to move
    const itemToMove = findTreeItem(items, activeId);
    if (!itemToMove) return items;

    // Helper function to insert item at specific position
    const insertAtPosition = (
        targetItems: TreeItem[],
        targetParentId: UniqueIdentifier | null,
        insertIndex: number
    ): TreeItem[] => {
        if (targetParentId === null) {
            // Insert at root level
            const newItems = [...targetItems];
            newItems.splice(insertIndex, 0, itemToMove);
            return newItems;
        }

        // Insert as child of target parent
        return targetItems.map((item) => {
            if (item.id === targetParentId) {
                const newChildren = [...item.children];
                newChildren.splice(insertIndex, 0, itemToMove);
                return { ...item, children: newChildren };
            }
            return {
                ...item,
                children: insertAtPosition(item.children, targetParentId, insertIndex),
            };
        });
    };

    // Determine target position - insert after the over item
    const targetParentId = overItem.parentId;
    let targetIndex = overItem.index + 1; // Insert after the target item

    // If moving within the same parent and the active item is before the target
    if (activeItem.parentId === targetParentId && activeItem.index < overItem.index) {
        targetIndex = overItem.index; // No need to add 1 since we removed the active item
    }

    return insertAtPosition(itemsWithoutActive, targetParentId, targetIndex);
};

/**
 * Gets all ancestor IDs for a given item
 * @param items - The tree items
 * @param id - The item ID
 * @returns Array of ancestor IDs from root to immediate parent
 */
export const getAncestorIds = (items: TreeItem[], id: UniqueIdentifier): UniqueIdentifier[] => {
    const findAncestors = (
        items: TreeItem[],
        targetId: UniqueIdentifier,
        ancestors: UniqueIdentifier[] = []
    ): UniqueIdentifier[] | null => {
        for (const item of items) {
            if (item.id === targetId) {
                return ancestors;
            }

            const found = findAncestors(item.children, targetId, [...ancestors, item.id]);
            if (found) return found;
        }
        return null;
    };

    return findAncestors(items, id) || [];
};

/**
 * Checks if an item can be dropped on another item
 * @param activeId - The item being dragged
 * @param overId - The item being dropped on
 * @param items - The tree items
 * @returns Whether the drop is valid
 */
export const canDropItem = (
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier,
    items: TreeItem[]
): boolean => {
    if (activeId === overId) return false;

    // Check if trying to drop on a descendant (would create a cycle)
    const activeDescendants = getDescendantIds(items, activeId);
    return !activeDescendants.includes(overId.toString());
};

/**
 * Gets all (including children of children) descendant IDs for a given item
 * @param items - The tree items
 * @param id - The item ID
 * @returns Array of all descendant IDs
 */
export const getDescendantIds = (items: TreeItem[], id: UniqueIdentifier): UniqueIdentifier[] => {
    const item: TreeItem | null = findTreeItem(items, id);
    if (!item) return [];

    const collectDescendants = (children: TreeItem[]): UniqueIdentifier[] => {
        const descendants: UniqueIdentifier[] = [];
        for (const child of children) {
            descendants.push(child.id);
            descendants.push(...collectDescendants(child.children));
        }
        return descendants;
    };

    return collectDescendants(item.children);
};
