import { useSortableTreeUIStore } from '@/features/label/components/tree-own/store';
import { FlattenedItem } from '@/features/label/components/tree-own/types';
import { flattenTree } from '@/features/label/components/tree-own/utils';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export const useSortableTree = () => {
    const { expandedIds, toggleExpandedId } = useSortableTreeUIStore();
    const [flattenedItems, setFlattenedItems] = useState<FlattenedItem[]>([]);

    const { data: items = [] } = useQuery({
        queryKey: ['labals'],
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
    useEffect(() => {
        setFlattenedItems(flattenTree(items, expandedIds));
    }, [items, expandedIds]);

    return {
        items,
        flattenedItems,
        expandedIds,
        toggleExpandedId,
    };
};
