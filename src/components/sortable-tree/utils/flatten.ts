import { FlattenedItem, TreeItem, TreeItemData } from '@/components/sortable-tree/types';
import { UniqueIdentifier } from '@dnd-kit/core';

/**
 * Radically simplified tree flattening
 */
export const flattenTree = <D extends TreeItemData>(
    items: TreeItem<D>[],
    expandedIds: Set<UniqueIdentifier> = new Set(),
    depth = 0,
    parent: FlattenedItem<D> | null = null,
    indexCounter = { value: 0 }
): FlattenedItem<D>[] => {
    const result: FlattenedItem<D>[] = [];

    items.forEach((item, currentDepthIndex) => {
        const flattenedItem = {
            ...item,
            parent,
            index: indexCounter.value++,
            currentDepthIndex,
            depth,
            collapsed: !expandedIds.has(item.id),
            childrenCount: item.children.length,
            hasChildren: item.children.length > 0,
        };

        result.push(flattenedItem);

        // Add children if expanded
        if (item.children.length > 0 && expandedIds.has(item.id)) {
            result.push(
                ...flattenTree(item.children, expandedIds, depth + 1, flattenedItem, indexCounter)
            );
        }
    });

    return result;
};
