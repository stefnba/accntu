import { useSortableTreeUIStore } from '@/features/label/components/tree-own/store';
import { flattenTree } from '@/features/label/components/tree-own/utils';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

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

    return {
        items,
        flattenedItems,
        expandedIds,
        toggleExpandedId,
    };
};
