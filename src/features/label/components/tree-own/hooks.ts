import { TreeItem } from '@/features/label/components/sortable-tree';
import { useSortableTreeUIStore } from '@/features/label/components/tree-own/store';
import { flattenTree } from '@/features/label/components/tree-own/utils';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

export const useSortableTree = () => {
    const { expandedIds, toggleExpandedId } = useSortableTreeUIStore();

    const { data: items = [] } = useQuery({
        queryKey: ['labels'],
        queryFn: () => {
            return [
                {
                    id: 'Home',
                    children: [],
                },
                {
                    id: 'Collections',
                    children: [
                        { id: 'Spring', children: [] },
                        { id: 'Summer', children: [] },
                    ],
                },
                {
                    id: 'My Account',
                    children: [{ id: 'Addresses', children: [] }],
                },
            ];
        },
    });

    // flatten the tree when the items or expanded items change
    const flattenedItems = useMemo(() => flattenTree(items, expandedIds), [items, expandedIds]);

    const handleMove = useCallback((items: TreeItem[]) => {
        // update the items
    }, []);

    return {
        // raw data
        items,
        // flattened tree
        flattenedItems,
        // expanded ids
        expandedIds,
        // actions
        toggleExpandedId,
        handleMove,
    };
};
