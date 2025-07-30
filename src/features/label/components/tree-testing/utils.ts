import type { UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import type { FlattenedItem, TreeItem, TreeItems } from './types';

/**
 * Detects iOS devices for touch-specific behavior.
 * 
 * Purpose: Identifies iOS devices to apply platform-specific optimizations
 * - Used for touch interaction adjustments
 * - Helps with drag behavior differences on iOS
 * 
 * Optimization suggestions:
 * - Use modern navigator.userAgentData when available
 * - Consider lazy evaluation to avoid running on every import
 * - Add support for iPadOS detection
 */
export const iOS = /iPad|iPhone|iPod/.test(navigator.platform);

/**
 * Calculates the depth level based on horizontal drag offset.
 * 
 * Purpose: Converts pixel offset to tree depth levels
 * - Determines how many levels deep an item should be nested
 * - Uses indentation width as the unit of measurement
 * 
 * Optimization suggestions:
 * - Add snapping threshold to prevent micro-movements
 * - Use Math.floor for more predictable behavior
 * - Consider non-linear scaling for deeper nesting
 */
function getDragDepth(offset: number, indentationWidth: number) {
    return Math.round(offset / indentationWidth);
}

/**
 * Calculates the projected position and constraints for a dragged item.
 * 
 * Purpose: Determines where an item will be placed when dropped
 * - Calculates new depth based on drag offset
 * - Enforces min/max depth constraints
 * - Determines the new parent ID
 * 
 * This is the core algorithm for tree restructuring during drag operations.
 * 
 * Optimization suggestions:
 * - Cache projection results for identical inputs
 * - Use binary search for large item arrays
 * - Pre-calculate valid drop zones
 * - Consider using spatial indexing for performance
 */
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

    return { depth, maxDepth, minDepth, parentId: getParentId() };

    /**
     * Determines the parent ID for the projected position.
     * 
     * Purpose: Finds the appropriate parent based on depth and position
     * - Returns null for root-level items
     * - Handles same-level siblings
     * - Finds parent for nested items
     * 
     * Optimization suggestions:
     * - Use Map for O(1) parent lookup
     * - Cache parent relationships
     * - Consider using tree traversal algorithms
     */
    function getParentId() {
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
}

/**
 * Calculates the maximum allowed depth for an item.
 * 
 * Purpose: Prevents items from being nested too deeply
 * - Based on the previous item's depth
 * - Ensures logical tree structure
 * 
 * Optimization suggestions:
 * - Add configurable max depth limit
 * - Consider business logic constraints
 */
function getMaxDepth({ previousItem }: { previousItem: FlattenedItem }) {
    if (previousItem) {
        return previousItem.depth + 1;
    }

    return 0;
}

/**
 * Calculates the minimum allowed depth for an item.
 * 
 * Purpose: Prevents items from being placed at invalid depths
 * - Based on the next item's depth
 * - Maintains tree hierarchy rules
 * 
 * Optimization suggestions:
 * - Add validation for complex tree rules
 * - Consider parent-child relationship constraints
 */
function getMinDepth({ nextItem }: { nextItem: FlattenedItem }) {
    if (nextItem) {
        return nextItem.depth;
    }

    return 0;
}

/**
 * Recursively flattens a tree structure into a linear array.
 * 
 * Purpose: Converts hierarchical tree into flat structure for DndKit
 * - Maintains parent-child relationships
 * - Preserves depth information
 * - Keeps original index for ordering
 * 
 * Optimization suggestions:
 * - Use iterative approach for very deep trees
 * - Consider using generators for memory efficiency
 * - Add early termination for large datasets
 * - Use tail call optimization
 */
function flatten(
    items: TreeItems,
    parentId: UniqueIdentifier | null = null,
    depth = 0
): FlattenedItem[] {
    return items.reduce<FlattenedItem[]>((acc, item, index) => {
        return [
            ...acc,
            { ...item, parentId, depth, index },
            ...flatten(item.children, item.id, depth + 1),
        ];
    }, []);
}

/**
 * Public interface for flattening a tree structure.
 * 
 * Purpose: Exposes the flatten functionality with a clean API
 * - Wrapper around the internal flatten function
 * - Starts with root-level parameters
 * 
 * Optimization suggestions:
 * - Add memoization for frequently accessed trees
 * - Consider streaming for very large trees
 */
export function flattenTree(items: TreeItems): FlattenedItem[] {
    return flatten(items);
}

/**
 * Rebuilds a hierarchical tree from a flattened array.
 * 
 * Purpose: Converts flat array back to tree structure after reordering
 * - Reconstructs parent-child relationships
 * - Maintains proper nesting structure
 * - Essential for persisting drag and drop changes
 * 
 * Optimization suggestions:
 * - Use Map for O(1) node lookup instead of find operations
 * - Consider using immutable data structures
 * - Add validation for malformed input
 * - Use more efficient tree building algorithms
 */
export function buildTree(flattenedItems: FlattenedItem[]): TreeItems {
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
}

/**
 * Finds an item in a flat array by its ID.
 * 
 * Purpose: Simple linear search for items
 * - Used for quick lookups in small arrays
 * - Returns undefined if not found
 * 
 * Optimization suggestions:
 * - Use Map for O(1) lookup with large datasets
 * - Consider binary search for sorted arrays
 * - Add type safety with proper return types
 */
export function findItem(items: TreeItem[], itemId: UniqueIdentifier) {
    return items.find(({ id }) => id === itemId);
}

/**
 * Recursively searches for an item in a hierarchical tree.
 * 
 * Purpose: Deep search through nested tree structure
 * - Searches all levels of the tree
 * - Returns first matching item
 * - Used for complex tree operations
 * 
 * Optimization suggestions:
 * - Use breadth-first search for items likely to be shallow
 * - Add memoization for repeated searches
 * - Consider using path-based indexing
 * - Implement early termination strategies
 */
export function findItemDeep(items: TreeItems, itemId: UniqueIdentifier): TreeItem | undefined {
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
}

/**
 * Recursively removes an item from the tree structure.
 * 
 * Purpose: Deletes an item and maintains tree integrity
 * - Removes item from any level of nesting
 * - Preserves sibling relationships
 * - Maintains tree structure
 * 
 * Optimization suggestions:
 * - Use immutable updates with spread operators
 * - Consider using Immer for cleaner immutable updates
 * - Add batch removal for multiple items
 * - Implement soft delete with undo functionality
 */
export function removeItem(items: TreeItems, id: UniqueIdentifier) {
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
}

/**
 * Updates a specific property of an item in the tree.
 * 
 * Purpose: Modifies item properties while maintaining tree structure
 * - Type-safe property updates
 * - Recursive tree traversal
 * - Functional approach with setter function
 * 
 * Optimization suggestions:
 * - Use structural sharing for better performance
 * - Consider using lenses for complex property updates
 * - Add validation for property changes
 * - Implement batch property updates
 */
export function setProperty<T extends keyof TreeItem>(
    items: TreeItems,
    id: UniqueIdentifier,
    property: T,
    setter: (value: TreeItem[T]) => TreeItem[T]
) {
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
}

/**
 * Recursively counts all children in a tree branch.
 * 
 * Purpose: Calculates total number of descendants
 * - Used for displaying child counts
 * - Helps with tree statistics
 * - Recursive counting algorithm
 * 
 * Optimization suggestions:
 * - Use tail recursion for better performance
 * - Consider memoization for stable tree structures
 * - Add early termination for large counts
 * - Use iterative approach for very deep trees
 */
function countChildren(items: TreeItem[], count = 0): number {
    return items.reduce((acc, { children }) => {
        if (children.length) {
            return countChildren(children, acc + 1);
        }

        return acc + 1;
    }, count);
}

/**
 * Gets the total number of children for a specific item.
 * 
 * Purpose: Provides child count for UI display
 * - Finds item in tree
 * - Counts all descendants
 * - Returns 0 if item not found
 * 
 * Optimization suggestions:
 * - Cache child counts for performance
 * - Use Map for O(1) item lookup
 * - Consider lazy evaluation for large trees
 */
export function getChildCount(items: TreeItems, id: UniqueIdentifier) {
    const item = findItemDeep(items, id);

    return item ? countChildren(item.children) : 0;
}

/**
 * Removes all children of specified parent items from flattened array.
 * 
 * Purpose: Filters out children of collapsed or dragged items
 * - Used for hiding collapsed tree branches
 * - Maintains flat array structure
 * - Handles multiple parent IDs
 * 
 * Optimization suggestions:
 * - Use Set for O(1) ID lookup instead of array.includes
 * - Consider using bit masking for large ID sets
 * - Add early termination for performance
 * - Use more efficient filtering algorithms
 */
export function removeChildrenOf(items: FlattenedItem[], ids: UniqueIdentifier[]) {
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
}
