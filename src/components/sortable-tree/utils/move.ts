import { FlattenedItem, ParentItem } from '@/components/sortable-tree/types';
import { UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

type TMoveOperation =
    | {
          type: 'insert-before' | 'insert-after' | 'nest-under';
          targetId: UniqueIdentifier;
          activeId: UniqueIdentifier;
      }
    | {
          type: 'root-start' | 'root-end';
      }
    | {
          type: 'nest-under';
          parentId: UniqueIdentifier;
          activeId: UniqueIdentifier;
      };

interface MoveResult {
    items: FlattenedItem[];
    operation: TMoveOperation;
    changes: {
        depth: {
            previous: number;
            new: number;
        };
        index: {
            previous: number;
            new: number;
        };
        parent: {
            previous: ParentItem | null;
            new: ParentItem | null;
        };
        currentDepthIndex: {
            previous: number;
            new: number;
        };
    };
}

/**
 * Performs the actual move operation with full parent/child relationship calculations
 * @param activeId - The ID of the item being moved
 * @param overId - The ID of the item being dropped on
 * @param projectedDepth - The validated depth from the drag preview
 * @param items - The current flattened items
 * @returns The new items array with the move applied, or null if invalid
 */
export function performMove(
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier,
    projectedDepth: number,
    items: FlattenedItem[],
    expandItem: (id: UniqueIdentifier) => void
): MoveResult | null {
    // Find indices
    const activeIndex = items.findIndex((item) => item.id === activeId);
    const overIndex = items.findIndex((item) => item.id === overId);

    if (activeIndex === -1 || overIndex === -1) {
        return null;
    }

    const activeItem = items[activeIndex];

    // Simulate the array move to get neighboring items
    const newItems = arrayMove(items, activeIndex, overIndex);
    const previousItem = newItems[overIndex - 1] || null;
    const nextItem = newItems[overIndex + 1] || null;

    // Determine the operation type and calculate new properties
    let operation: TMoveOperation;
    let newParent: ParentItem | null = null;
    let newCurrentDepthIndex = 0;

    // Nesting under previous item
    // Previous item can be a node w/o children or a node w/ children that is collapsed (i.e. children are not visible)
    if (previousItem && projectedDepth > previousItem.depth) {
        operation = {
            type: 'nest-under',
            parentId: previousItem.id,
            activeId,
        };
        newParent = previousItem;
        // If the previous item has children, we need to set the current depth index to the number of children
        // Otherwise, we set it to 0 (to make it the first child)
        newCurrentDepthIndex = previousItem.hasChildren ? previousItem.childrenCount : 0;

        // If the previous item is collapsed, expand it
        if (previousItem.collapsed) {
            // Expand the previous item
            expandItem(previousItem.id);
        }
    }
    // Insert before (first item in list or at start of level)
    else if (!previousItem || (nextItem && projectedDepth < nextItem.depth)) {
        operation = {
            type: 'insert-before',
            targetId: overId,
            activeId,
        };
        // First item in entire list
        if (!previousItem) {
            newParent = null;
            newCurrentDepthIndex = 0;
        }
        // First item at this depth level
        else {
            newParent = findParentAtDepth(newItems, overIndex, projectedDepth);
            newCurrentDepthIndex = 0;
        }
    }
    // Insert after (higher level than previous item)
    // Example: Inserting after a node that has children that are expanded
    else if (previousItem && projectedDepth < previousItem.depth) {
        // Find the item at the same depth as the projection that is directtly before the over index
        const previousItemAtDepth =
            newItems
                .filter((item) => item.depth === projectedDepth)
                .filter((item) => overIndex > item.index)
                .at(-1) || null;

        // If there is no item at the same depth as the projection, return null
        if (!previousItemAtDepth) return null;

        operation = {
            type: 'insert-after',
            targetId: previousItemAtDepth.id,
            activeId,
        };

        newParent = previousItemAtDepth.parent;
        newCurrentDepthIndex = previousItemAtDepth.currentDepthIndex + 1;
    }
    // Insert after (same level as previous item)
    else {
        operation = {
            type: 'insert-after',
            targetId: overId,
            activeId,
        };
        if (previousItem && previousItem.parent) {
            // Find the full parent item instead of using the partial reference
            newParent = items.find((item) => item.id === previousItem.parent!.id) || null;
            newCurrentDepthIndex = previousItem.currentDepthIndex + 1;
        }
    }

    // Create the updated item with new properties
    const updatedItem: FlattenedItem = {
        ...activeItem,
        index: overIndex, // Will be recalculated when flattening
        currentDepthIndex: newCurrentDepthIndex,
        depth: projectedDepth,
        parent: newParent
            ? {
                  id: newParent.id,
                  index: newParent.index,
                  depth: newParent.depth,
                  childrenCount: newParent.childrenCount,
              }
            : null,
    };

    // Apply the move and update the moved item
    newItems[overIndex] = updatedItem;

    return {
        items: newItems,
        operation: operation,
        changes: {
            depth: {
                previous: activeItem.depth,
                new: projectedDepth,
            },
            index: {
                previous: activeItem.index,
                new: overIndex,
            },
            parent: {
                previous: activeItem.parent,
                new: newParent,
            },
            currentDepthIndex: {
                previous: activeItem.currentDepthIndex,
                new: newCurrentDepthIndex,
            },
        },
    };
}

/**
 * Finds the parent item at a specific depth level
 * @param items - The items array
 * @param currentIndex - The current index to search backwards from
 * @param targetDepth - The depth level to find parent for
 * @returns The parent item or null if none found
 */
function findParentAtDepth(
    items: FlattenedItem[],
    currentIndex: number,
    targetDepth: number
): FlattenedItem | null {
    if (targetDepth === 0) {
        return null;
    }

    // Search backwards for an item at depth targetDepth - 1
    for (let i = currentIndex - 1; i >= 0; i--) {
        const item = items[i];
        if (item.depth === targetDepth - 1) {
            return item;
        }
        // If we encounter an item at a shallower depth, stop searching
        if (item.depth < targetDepth - 1) {
            break;
        }
    }

    return null;
}

/**
 * Helper function to validate if a move operation is valid
 * @param activeId - The ID of the item being moved
 * @param overId - The ID of the item being dropped on
 * @param items - The current flattened items
 * @returns Whether the move is valid
 */
export function canPerformMove(
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier,
    items: FlattenedItem[]
): boolean {
    if (activeId === overId) {
        return false;
    }

    const activeItem = items.find((item) => item.id === activeId);
    const overItem = items.find((item) => item.id === overId);

    if (!activeItem || !overItem) {
        return false;
    }

    // Check if trying to drop on a descendant (would create a cycle)
    return !isDescendant(activeItem, overId, items);
}

/**
 * Checks if targetId is a descendant of parentItem
 * @param parentItem - The potential parent item
 * @param targetId - The ID to check
 * @param items - All items for traversal
 * @returns Whether targetId is a descendant
 */
function isDescendant(
    parentItem: FlattenedItem,
    targetId: UniqueIdentifier,
    items: FlattenedItem[]
): boolean {
    // Find all children of the parent item
    const children = items.filter((item) => item.parent?.id === parentItem.id);

    for (const child of children) {
        if (child.id === targetId) {
            return true;
        }
        // Recursively check child's descendants
        if (isDescendant(child, targetId, items)) {
            return true;
        }
    }

    return false;
}
