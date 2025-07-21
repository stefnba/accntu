import { INDENTATION_WIDTH } from '@/features/label/components/tree-own/config';
import { FlattenedItem, TreeItem } from '@/features/label/components/tree-own/types';
import { UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

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
export const insertItemBefore = (
    items: TreeItem[],
    activeId: UniqueIdentifier,
    targetId: UniqueIdentifier
): TreeItem[] => {
    const itemToMove = findTreeItem(items, activeId);
    if (!itemToMove) return items;

    const itemsWithoutActive = removeTreeItem(items, activeId);

    /**
     * Inserts an item before the target item at the same level
     * @param items - The tree items
     * @param activeId - The ID of the item to move
     * @param targetId - The ID of the item to insert before
     * @returns The new tree with the item inserted before the target item
     */
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
export const insertItemAfter = (
    items: TreeItem[],
    activeId: UniqueIdentifier,
    targetId: UniqueIdentifier
): TreeItem[] => {
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
export const nestItemUnder = (
    items: TreeItem[],
    activeId: UniqueIdentifier,
    parentId: UniqueIdentifier
): TreeItem[] => {
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
    const activeItem = findTreeItem(items, activeId);
    if (!activeItem) return false;

    // Simple descendant check - inline the logic
    const isDescendant = (parent: TreeItem, targetId: UniqueIdentifier): boolean => {
        for (const child of parent.children) {
            if (child.id === targetId) return true;
            if (isDescendant(child, targetId)) return true;
        }
        return false;
    };

    return !isDescendant(activeItem, overId);
};

/**
 * Gets the number of children for a given item (simplified inline)
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

export const getDropProjection = ({
    items,
    activeId,
    overId,
    dragOffset,
}: {
    items: FlattenedItem[];
    activeId: UniqueIdentifier | null;
    overId: UniqueIdentifier | null;
    dragOffset: number;
}) => {
    if (!activeId || !overId) {
        return null;
    }

    const activeItem = items.find((item) => item.id === activeId);
    const overItem = items.find((item) => item.id === overId);

    if (!overItem || !activeItem) {
        return null;
    }

    // Calculate the projected depth based on the drag offset
    // It should never be less than 0
    // It should never be greater the over item's depth + 1
    const projectedDepth = Math.min(
        overItem.depth + 1,
        Math.max(0, activeItem.depth + Math.round(dragOffset / INDENTATION_WIDTH))
    );

    return {
        overId: overItem.id,
        parentId: overItem.parentId,
        currentDepth: activeItem.depth,
        projectedDepth,
        insertIndex: overItem.index,
    };
};

export function getProjection(
    items: FlattenedItem[],
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier,
    dragOffset: number,
    indentationWidth: number
) {
    const overItemIndex = items.findIndex(({ id }) => id === overId);
    const activeItemIndex = items.findIndex(({ id }) => id === activeId);
    const activeItem = items[activeItemIndex];
    const newItems = arrayMove(items, activeItemIndex, overItemIndex);
    const previousItem = newItems[overItemIndex - 1];
    const nextItem = newItems[overItemIndex + 1];
    const dragDepth = getDragDepth(dragOffset, indentationWidth);
    const projectedDepth = activeItem.depth + dragDepth;
    const maxDepth = getMaxDepth({
        previousItem,
    });
    const minDepth = getMinDepth({ nextItem });
    let depth = projectedDepth;

    if (projectedDepth >= maxDepth) {
        depth = maxDepth;
    } else if (projectedDepth < minDepth) {
        depth = minDepth;
    }

    return {
        depth,
        maxDepth,
        minDepth,
        parentId: getParentIdForProjection({ depth, previousItem, newItems, overItemIndex }),
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
        return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
        return previousItem.id;
    }

    const newParent = newItems
        .slice(0, overItemIndex)
        .reverse()
        .find((item) => item.depth === depth)?.parentId;

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
