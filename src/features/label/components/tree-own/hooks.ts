import useSortableTreeStore from '@/features/label/components/tree-own/store';
import { flattenTree } from '@/features/label/components/tree-own/utils';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useCallback, useEffect } from 'react';

export const useSortableTree = () => {
    const {
        items,
        flattenedItems,
        collapsedItems,
        setCollapsedItems,
        setItems,
        setFlattenedItems,
        setSortableIds,
        sortableIds,
    } = useSortableTreeStore();

    useEffect(() => {
        setSortableIds(new Set(items.map((item) => item.id)));
        setFlattenedItems(flattenTree(items, collapsedItems));
    }, [items, collapsedItems, setFlattenedItems, setSortableIds]);

    const handleFlattenItems = useCallback(() => {
        setFlattenedItems(flattenTree(items, collapsedItems));
    }, [items, collapsedItems, setFlattenedItems]);

    /**
     * Toggle the collapse state of an item
     */
    const handleToggleCollapse = useCallback(
        (id: UniqueIdentifier) => {
            if (isCollapsed(id)) {
                collapsedItems.delete(id);
            } else {
                collapsedItems.add(id);
            }
            setCollapsedItems(collapsedItems);
            handleFlattenItems();
        },
        [collapsedItems, setCollapsedItems]
    );

    /**
     * Check if an children of an item is collapsed
     */
    const isCollapsed = useCallback(
        (id: UniqueIdentifier) => {
            return collapsedItems.has(id);
        },
        [collapsedItems]
    );

    return {
        items,
        flattenedItems,
        collapsedItems,
        handleToggleCollapse,
        isCollapsed,
        sortableIds,
        setItems,
    };
};
