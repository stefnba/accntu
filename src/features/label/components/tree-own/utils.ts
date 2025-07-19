import {
    FlattenedItem,
    TreeItem,
    TreeMoveOperation,
} from '@/features/label/components/tree-own/types';
import { UniqueIdentifier } from '@dnd-kit/core';

/**
 * Flattens a tree structure into a linear array with hierarchy information
 * @param items - The tree items to flatten
 * @param expandedIds - Set of expanded item IDs
 * @param parentId - The parent ID for the current level
 * @param depth - The current depth level
 * @returns A flat array of items with depth and parent information
 */
const flatten = (
    items: TreeItem[],
    expandedIds: Set<UniqueIdentifier> = new Set(),
    parentId: UniqueIdentifier | null = null,
    depth = 0
): FlattenedItem[] => {
    return items.reduce<FlattenedItem[]>((acc, item, index) => {
        const flattenedItem: FlattenedItem = {
            ...item,
            parentId,
            depth,
            index,
            collapsed: !expandedIds.has(item.id),
            childrenCount: item.children.length,
            hasChildren: item.children.length > 0,
        };

        acc.push(flattenedItem);

        // Only flatten children if item is not collapsed
        if (item.children.length > 0 && expandedIds.has(item.id)) {
            acc.push(...flatten(item.children, expandedIds, item.id, depth + 1));
        }

        return acc;
    }, []);
};

/**
 * Public API for flattening a tree structure
 * @param items - The tree items to flatten
 * @param expandedIds - Set of expanded item IDs
 * @returns A flat array of items with hierarchy information
 */
export const flattenTree = (
    items: TreeItem[],
    expandedIds: Set<UniqueIdentifier> = new Set()
): FlattenedItem[] => flatten(items, expandedIds);

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
 * Drop intent types for enhanced tree operations
 */
export type DropIntent = 
    | { type: 'insert-before'; targetId: UniqueIdentifier }
    | { type: 'insert-after'; targetId: UniqueIdentifier }
    | { type: 'nest-under'; parentId: UniqueIdentifier };

/**
 * Detects drop intent based on mouse position within target item
 */
export const detectDropIntent = (
    relativeY: number, 
    targetItem: FlattenedItem,
    maxDepth: number = 5
): DropIntent => {
    // Top 25% = insert before
    if (relativeY < 0.25) {
        return { type: 'insert-before', targetId: targetItem.id };
    }
    
    // Bottom 25% = insert after  
    if (relativeY > 0.75) {
        return { type: 'insert-after', targetId: targetItem.id };
    }
    
    // Middle 50% = nest under (if depth allows)
    if (targetItem.depth < maxDepth) {
        return { type: 'nest-under', parentId: targetItem.id };
    }
    
    // Fallback to insert after if max depth reached
    return { type: 'insert-after', targetId: targetItem.id };
};

/**
 * Inserts an item before the target item at the same level
 */
export const insertItemBefore = (items: TreeItem[], activeId: UniqueIdentifier, targetId: UniqueIdentifier): TreeItem[] => {
    const itemToMove = findTreeItem(items, activeId);
    if (!itemToMove) return items;

    const itemsWithoutActive = removeTreeItem(items, activeId);
    
    const insertAtPosition = (currentItems: TreeItem[]): TreeItem[] => {
        return currentItems.reduce<TreeItem[]>((acc, item) => {
            if (item.id === targetId) {
                // Insert before this item
                return [...acc, itemToMove, item];
            }
            
            return [
                ...acc,
                {
                    ...item,
                    children: insertAtPosition(item.children),
                },
            ];
        }, []);
    };
    
    return insertAtPosition(itemsWithoutActive);
};

/**
 * Inserts an item after the target item at the same level
 */
export const insertItemAfter = (items: TreeItem[], activeId: UniqueIdentifier, targetId: UniqueIdentifier): TreeItem[] => {
    const itemToMove = findTreeItem(items, activeId);
    if (!itemToMove) return items;

    const itemsWithoutActive = removeTreeItem(items, activeId);
    
    const insertAtPosition = (currentItems: TreeItem[]): TreeItem[] => {
        return currentItems.reduce<TreeItem[]>((acc, item) => {
            if (item.id === targetId) {
                // Insert after this item
                return [...acc, item, itemToMove];
            }
            
            return [
                ...acc,
                {
                    ...item,
                    children: insertAtPosition(item.children),
                },
            ];
        }, []);
    };
    
    return insertAtPosition(itemsWithoutActive);
};

/**
 * Nests an item under the target item as its first child
 */
export const nestItemUnder = (items: TreeItem[], activeId: UniqueIdentifier, parentId: UniqueIdentifier): TreeItem[] => {
    const itemToMove = findTreeItem(items, activeId);
    if (!itemToMove) return items;

    const itemsWithoutActive = removeTreeItem(items, activeId);
    
    const insertAsChild = (currentItems: TreeItem[]): TreeItem[] => {
        return currentItems.map((item) => {
            if (item.id === parentId) {
                // Add as first child
                return {
                    ...item,
                    children: [itemToMove, ...item.children],
                };
            }
            
            return {
                ...item,
                children: insertAsChild(item.children),
            };
        });
    };
    
    return insertAsChild(itemsWithoutActive);
};

/**
 * Enhanced move function that handles different drop intents
 */
export const moveTreeItemWithIntent = (
    items: TreeItem[], 
    activeId: UniqueIdentifier, 
    intent: DropIntent
): TreeItem[] => {
    switch (intent.type) {
        case 'insert-before':
            return insertItemBefore(items, activeId, intent.targetId);
        case 'insert-after':
            return insertItemAfter(items, activeId, intent.targetId);
        case 'nest-under':
            return nestItemUnder(items, activeId, intent.parentId);
        default:
            return items;
    }
};

/**
 * Legacy move function for backward compatibility
 * @deprecated Use moveTreeItemWithIntent instead
 */
export const moveTreeItem = (items: TreeItem[], operation: TreeMoveOperation): TreeItem[] => {
    const { activeId, overItem } = operation;
    
    // Default to insert-after behavior for compatibility
    return insertItemAfter(items, activeId, overItem.id);
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

/**
 * Gets the number of children for a given item
 * @param items - The tree items
 * @param id - The item ID
 * @returns Number of direct children
 */
export const getChildCount = (items: TreeItem[], id: UniqueIdentifier): number => {
    const item = findTreeItem(items, id);
    return item ? item.children.length : 0;
};

/**
 * Removes children of specified parent IDs from flattened items
 * Used to hide children when their parent is being dragged
 * @param items - The flattened items
 * @param ids - Parent IDs whose children should be removed
 * @returns Filtered items without the children
 */
export const removeChildrenOf = (
    items: FlattenedItem[],
    ids: UniqueIdentifier[]
): FlattenedItem[] => {
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
