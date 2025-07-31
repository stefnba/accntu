import { FlattenedItem, ParentItem, TreeItem } from '@/components/sortable-tree/types';
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
            index: 0, // Will be updated after all items are flattened
            currentDepthIndex, // Index under the same parent (0, 1, 2, 3 under Collections, etc.)
            collapsed: !expandedIds.has(item.id),
            childrenCount: item.children.length,
            hasChildren: item.children.length > 0,
        };

        acc.push(flattenedItem);

        // Only flatten children if item is not collapsed
        if (item.children.length > 0 && expandedIds.has(item.id)) {
            // Create parent reference for children (index will be updated later)
            const parentRef = {
                id: item.id,
                index: 0, // Temporary, will be updated
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
): FlattenedItem[] => {
    const flattenedItems = flatten(items, expandedIds);
    
    // Update global indices and parent references after flattening
    return flattenedItems.map((item, globalIndex) => {
        const updatedItem = {
            ...item,
            index: globalIndex,
        };
        
        // Update parent reference with correct index if parent exists
        if (item.parent) {
            const parentIndex = flattenedItems.findIndex(p => p.id === item.parent!.id);
            updatedItem.parent = {
                ...item.parent,
                index: parentIndex,
            };
        }
        
        return updatedItem;
    });
};