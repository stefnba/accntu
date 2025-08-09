import { FlattenedItem, FlattenedTreeItemBase } from '@/components/sortable-tree/types';
import { UniqueIdentifier } from '@dnd-kit/core';

export function buildTree<D extends FlattenedTreeItemBase>(
    items: FlattenedItem<D>[]
): FlattenedItem<D>[] {
    // Track the local index for each parentId
    const parentIndexMap = new Map<UniqueIdentifier | null, number>();

    return items.map((item, globalIndex) => {
        // Get current index for this parent (or 0 if first occurrence)
        const currentIndex = parentIndexMap.get(item.parentId) ?? 0;

        // Update the index for this parent
        parentIndexMap.set(item.parentId, currentIndex + 1);

        return {
            ...item,
            index: currentIndex,
            globalIndex,
        };
    });
}
