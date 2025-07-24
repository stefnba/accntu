import { FlattenedItem, TreeItem } from '@/features/label/components/tree-own/types';
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
            currentDepthIndex: 0,
            parentIndex: 0,
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
