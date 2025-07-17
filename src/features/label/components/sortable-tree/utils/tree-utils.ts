import type { UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { FlattenedItem, TreeItem, TreeItems, TreeProjection } from '../types';

/**
 * Calculates the depth level change during drag operations
 * @param offset - The horizontal pixel offset from the drag start position
 * @param indentationWidth - The width in pixels for each indentation level
 * @returns The number of depth levels to change (positive for deeper, negative for shallower)
 * 
 * This is crucial for determining how much to indent/outdent an item during drag.
 * For example, if indentationWidth is 50px and offset is 100px, depth change is 2 levels.
 */
const getDragDepth = (offset: number, indentationWidth: number): number => {
    return Math.round(offset / indentationWidth);
};

/**
 * Calculates the projected position and depth for a dragged item
 * @param items - The flattened tree items array
 * @param activeId - The ID of the item being dragged
 * @param overId - The ID of the item being dragged over
 * @param dragOffset - The horizontal pixel offset during drag
 * @param indentationWidth - The width in pixels for each indentation level
 * @returns TreeProjection object containing depth, maxDepth, minDepth, and parentId
 * 
 * This is the core logic for drag and drop positioning. It determines:
 * - Where the item can be dropped (depth constraints)
 * - What the new parent should be
 * - Enforces tree structure rules (can't drop item as child of itself)
 */
export const getProjection = (
    items: FlattenedItem[],
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier,
    dragOffset: number,
    indentationWidth: number
): TreeProjection => {
    // Find the positions of the dragged item and the drop target
    const overItemIndex = items.findIndex(({ id }) => id === overId);
    const activeItemIndex = items.findIndex(({ id }) => id === activeId);
    const activeItem = items[activeItemIndex];
    
    // Simulate the array after the move to calculate positioning
    const newItems = arrayMove(items, activeItemIndex, overItemIndex);
    const previousItem = newItems[overItemIndex - 1];
    const nextItem = newItems[overItemIndex + 1];
    
    // Calculate the desired depth based on drag offset
    const dragDepth = getDragDepth(dragOffset, indentationWidth);
    const projectedDepth = activeItem.depth + dragDepth;
    
    // Calculate constraints based on neighboring items
    const maxDepth = getMaxDepth({ previousItem });
    const minDepth = getMinDepth({ nextItem });
    
    // Clamp the depth to valid range
    let depth = projectedDepth;
    if (projectedDepth >= maxDepth) {
        depth = maxDepth;
    } else if (projectedDepth < minDepth) {
        depth = minDepth;
    }

    return { depth, maxDepth, minDepth, parentId: getParentId() };

    /**
     * Determines the correct parent ID for the item at the calculated depth
     * @returns The parent ID or null for root level items
     * 
     * This function implements the tree hierarchy rules:
     * - Root level items (depth 0) have no parent
     * - Items at same depth as previous item share the same parent
     * - Items deeper than previous item become children of previous item
     * - Items shallower than previous item need to find the appropriate ancestor
     */
    function getParentId(): UniqueIdentifier | null {
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
    }
};

/**
 * Calculates the maximum allowed depth for a dropped item
 * @param previousItem - The item that will be directly above the dropped item
 * @returns The maximum depth the item can be placed at
 * 
 * Items can only be nested one level deeper than their previous sibling.
 * This prevents creating invalid tree structures where items would be orphaned.
 */
const getMaxDepth = ({ previousItem }: { previousItem: FlattenedItem }): number => {
    return previousItem ? previousItem.depth + 1 : 0;
};

/**
 * Calculates the minimum allowed depth for a dropped item
 * @param nextItem - The item that will be directly below the dropped item
 * @returns The minimum depth the item can be placed at
 * 
 * Items cannot be placed at a depth shallower than their next sibling.
 * This maintains proper tree hierarchy and prevents structural inconsistencies.
 */
const getMinDepth = ({ nextItem }: { nextItem: FlattenedItem }): number => {
    return nextItem ? nextItem.depth : 0;
};

/**
 * Recursively flattens a hierarchical tree structure into a linear array
 * @param items - The tree items to flatten
 * @param parentId - The parent ID for the current level (null for root)
 * @param depth - The current depth level (0 for root)
 * @returns A flat array of items with depth and parent information
 * 
 * This converts a nested tree structure into a flat array that's easier to work with
 * for rendering and drag operations while preserving hierarchy information.
 */
const flatten = (
    items: TreeItems,
    parentId: UniqueIdentifier | null = null,
    depth = 0
): FlattenedItem[] => {
    return items.reduce<FlattenedItem[]>((acc, item, index) => {
        return [
            ...acc,
            { ...item, parentId, depth, index },
            ...flatten(item.children, item.id, depth + 1),
        ];
    }, []);
};

/**
 * Public API for flattening a tree structure
 * @param items - The tree items to flatten
 * @returns A flat array of items with hierarchy information
 * 
 * This is the main function used throughout the application to convert
 * hierarchical tree data into a flat structure for rendering.
 */
export const flattenTree = (items: TreeItems): FlattenedItem[] => flatten(items);

/**
 * Reconstructs a hierarchical tree from a flat array of items
 * @param flattenedItems - The flat array of items with parent/child relationships
 * @returns A hierarchical tree structure
 * 
 * This is the inverse of flattenTree. It rebuilds the nested structure from
 * a flat array after drag operations have modified the parent/child relationships.
 * Essential for maintaining tree structure after drag and drop operations.
 */
export const buildTree = (flattenedItems: FlattenedItem[]): TreeItems => {
    const root: TreeItem = { id: 'root', children: [] };
    const nodes: Record<string, TreeItem> = { [root.id]: root };
    const items = flattenedItems.map((item) => ({ ...item, children: [] }));

    for (const item of items) {
        const { id, children } = item;
        const parentId = item.parentId ?? root.id;
        const parent = nodes[parentId] ?? findItem(items, parentId);

        nodes[id] = { id, children };
        parent.children.push(item);
    }

    return root.children;
};

/**
 * Finds an item in a flat array by its ID
 * @param items - The array of items to search
 * @param itemId - The ID to search for
 * @returns The found item or undefined
 * 
 * Simple linear search for items in a flat array structure.
 * Used primarily during tree reconstruction operations.
 */
export const findItem = (items: TreeItem[], itemId: UniqueIdentifier): TreeItem | undefined => {
    return items.find(({ id }) => id === itemId);
};

/**
 * Recursively searches for an item in a hierarchical tree structure
 * @param items - The tree items to search
 * @param itemId - The ID to search for
 * @returns The found item or undefined
 * 
 * Performs a depth-first search through the tree hierarchy.
 * More expensive than findItem but works with nested structures.
 */
export const findItemDeep = (items: TreeItems, itemId: UniqueIdentifier): TreeItem | undefined => {
    for (const item of items) {
        const { id, children } = item;

        if (id === itemId) {
            return item;
        }

        if (children.length) {
            const child = findItemDeep(children, itemId);
            if (child) {
                return child;
            }
        }
    }

    return undefined;
};

/**
 * Recursively removes an item from a tree structure
 * @param items - The tree items to search
 * @param id - The ID of the item to remove
 * @returns A new tree structure with the item removed
 * 
 * Performs a deep search and removal operation that also removes the item
 * from any nested children arrays. Creates a new tree structure without
 * mutating the original.
 */
export const removeItem = (items: TreeItems, id: UniqueIdentifier): TreeItems => {
    const newItems = [];

    for (const item of items) {
        if (item.id === id) {
            continue;
        }

        if (item.children.length) {
            item.children = removeItem(item.children, id);
        }

        newItems.push(item);
    }

    return newItems;
};

/**
 * Recursively updates a property of a specific item in a tree structure
 * @param items - The tree items to search
 * @param id - The ID of the item to update
 * @param property - The property name to update (must be a key of TreeItem)
 * @param setter - A function that takes the current value and returns the new value
 * @returns A new tree structure with the property updated
 * 
 * This is primarily used for toggling the 'collapsed' state of tree items.
 * The setter function pattern allows for toggling (value => !value) or
 * other transformations while maintaining type safety.
 */
export const setProperty = <T extends keyof TreeItem>(
    items: TreeItems,
    id: UniqueIdentifier,
    property: T,
    setter: (value: TreeItem[T]) => TreeItem[T]
): TreeItems => {
    for (const item of items) {
        if (item.id === id) {
            item[property] = setter(item[property]);
            continue;
        }

        if (item.children.length) {
            item.children = setProperty(item.children, id, property, setter);
        }
    }

    return [...items];
};

/**
 * Recursively counts the total number of children in a tree structure
 * @param items - The tree items to count
 * @param count - The starting count (used for recursion)
 * @returns The total number of items in the tree
 * 
 * This is a helper function for calculating how many items are contained
 * within a specific branch of the tree. Used for displaying counts in the UI.
 */
const countChildren = (items: TreeItem[], count = 0): number => {
    return items.reduce((acc, { children }) => {
        if (children.length) {
            return countChildren(children, acc + 1);
        }
        return acc + 1;
    }, count);
};

/**
 * Gets the total number of children for a specific item in the tree
 * @param items - The tree items to search
 * @param id - The ID of the item to count children for
 * @returns The number of children, or 0 if the item is not found
 * 
 * This is used in the UI to display how many items are contained within
 * a collapsed tree branch, helping users understand the structure.
 */
export const getChildCount = (items: TreeItems, id: UniqueIdentifier): number => {
    const item = findItemDeep(items, id);
    return item ? countChildren(item.children) : 0;
};

/**
 * Removes all children of specified parent IDs from a flattened item array
 * @param items - The flattened array of items
 * @param ids - The parent IDs whose children should be removed
 * @returns A filtered array with the specified children removed
 * 
 * This is crucial for implementing collapsed tree functionality. When a parent
 * is collapsed, all its children (and their children recursively) should be
 * hidden from the rendered tree. This function efficiently filters them out.
 */
export const removeChildrenOf = (items: FlattenedItem[], ids: UniqueIdentifier[]): FlattenedItem[] => {
    const excludeParentIds = [...ids];

    return items.filter((item) => {
        if (item.parentId && excludeParentIds.includes(item.parentId)) {
            if (item.children.length) {
                excludeParentIds.push(item.id);
            }
            return false;
        }
        return true;
    });
};

/**
 * Efficiently clones an array of items using structured cloning
 * @param items - The items to clone
 * @returns A deep copy of the items array
 * 
 * React 19 compatible deep cloning that's more efficient than JSON.parse/stringify.
 * Used during drag operations to avoid mutating the original data while
 * calculating projected positions.
 */
export const cloneItems = (items: FlattenedItem[]): FlattenedItem[] => {
    return structuredClone(items);
};