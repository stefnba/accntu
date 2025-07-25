import { FlattenedItem, ParentItem, TreeItem } from '@/features/label/components/tree-own/types';
import { UniqueIdentifier } from '@dnd-kit/core';

/**
 * Flattens a tree structure into a linear array with hierarchy information
 * @param items - The tree items to flatten
 * @param expandedIds - Set of expanded item IDs
 * @param parent - The parent item for the current level
 * @param depth - The current depth level
 * @returns A flat array of items with depth and parent information
 */
const flatten = (
    items: TreeItem[],
    expandedIds: Set<UniqueIdentifier> = new Set(),
    parent: ParentItem | null = null,
    depth = 0
): FlattenedItem[] => {
    return items.reduce<FlattenedItem[]>((acc, item, currentDepthIndex) => {
        const flattenedItem: FlattenedItem = {
            ...item,
            parent, // Full parent object with id, index, depth
            depth,
            index: acc.length, // Global index in the final flattened array
            currentDepthIndex, // Index under the same parent (0, 1, 2, 3 under Collections, etc.)
            collapsed: !expandedIds.has(item.id),
            childrenCount: item.children.length,
            hasChildren: item.children.length > 0,
        };

        acc.push(flattenedItem);

        // Only flatten children if item is not collapsed
        if (item.children.length > 0 && expandedIds.has(item.id)) {
            // Create parent reference for children
            const parentRef = {
                id: item.id,
                index: flattenedItem.index,
                depth: flattenedItem.depth,
                childrenCount: flattenedItem.childrenCount,
            };

            acc.push(...flatten(item.children, expandedIds, parentRef, depth + 1));
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
