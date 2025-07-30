import { useSortableTreeUIStore } from '@/features/label/components/tree-own/store';
import { FlattenedItem, TreeItem } from '@/features/label/components/tree-own/types';
import {
    buildTreeFromFlattenedItems,
    DropIntent,
    flattenTree,
    moveTreeItemWithIntent,
} from '@/features/label/components/tree-own/utils';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

const QUERY_KEY = 'labels-sortable';

export const useSortableTree = () => {
    const queryClient = useQueryClient();
    const { expandedIds, toggleExpandedId } = useSortableTreeUIStore();

    // Server state - React Query manages this
    const {
        data: items = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: [QUERY_KEY],
        queryFn: async () => {
            // TODO: Replace with actual API call
            // return await api.labels.getAll();
            return [
                {
                    id: 'Home',
                    children: [
                        { id: 'Home1', children: [] },
                        { id: 'Home2', children: [] },
                    ],
                },
                {
                    id: 'Collections',
                    children: [
                        { id: 'Spring', children: [] },
                        { id: 'Summer', children: [] },
                        { id: 'Autumn', children: [] },
                        { id: 'Winter', children: [] },
                    ],
                },
                {
                    id: 'My Account',
                    children: [{ id: 'Addresses', children: [] }],
                },
            ];
        },
    });

    // Computed state - derived from server state + client state
    const flattenedItems = useMemo(() => flattenTree(items, expandedIds), [items, expandedIds]);

    // Move mutation with optimistic updates
    const moveMutation = useMutation({
        mutationFn: async ({
            activeId,
            intent,
        }: {
            activeId: UniqueIdentifier;
            intent: DropIntent;
        }) => {
            // Get the current state and apply the move
            const currentItems = queryClient.getQueryData<TreeItem[]>([QUERY_KEY]) || items;
            const result = moveTreeItemWithIntent(currentItems, activeId, intent);
            // TODO: Replace with actual API call
            return result;
        },
        onMutate: async ({ activeId, intent }) => {
            // Cancel outgoing refetches
            // await queryClient.cancelQueries({ queryKey: ['labels'] });

            // Snapshot previous value
            const previousItems = queryClient.getQueryData<TreeItem[]>([QUERY_KEY]);

            // Optimistically update cache
            if (previousItems) {
                const newItems = moveTreeItemWithIntent(previousItems, activeId, intent);
                queryClient.setQueryData([QUERY_KEY], newItems);
            }

            // Return context for rollback
            return { previousItems };
        },
        onError: (err, _variables, context) => {
            // Rollback on error
            if (context?.previousItems) {
                queryClient.setQueryData(['labels'], context.previousItems);
            }
            console.error('Move failed, rolling back:', err);
        },
        onSettled: (data, error) => {
            // If successful, update the cache with the final result
            // if (data && !error) {
            //     queryClient.setQueryData(['labels'], data);
            // }
            // Don't invalidate queries since we're using mock data
        },
    });

    /**
     * Optimistic move handler
     * @param newItems - The new items to move
     */
    const handleOptimisticMove = useCallback(
        (newItems: FlattenedItem[]) => {
            // Build the tree from the new items
            const tree = buildTreeFromFlattenedItems(newItems);

            // Optimistic update to the cache
            queryClient.setQueryData([QUERY_KEY], tree);

            // todo: call the mutation
            // return moveMutation.mutate({ activeId, intent });
        },
        [moveMutation]
    );

    return {
        // Server state
        items,
        isLoading,
        error,

        // Computed state
        flattenedItems,

        // Client-only UI state
        expandedIds,

        // Actions
        /**
         * ksks
         */
        handleOptimisticMove,
        toggleExpandedId,

        // Mutation state
        isMoving: moveMutation.isPending,
        moveError: moveMutation.error,
    };
};
