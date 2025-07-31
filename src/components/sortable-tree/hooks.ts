import { useSortableTreeUIStore } from '@/components/sortable-tree/store';
import { FlattenedItem, TreeItem } from '@/components/sortable-tree/types';
import {
    buildTreeFromFlattenedItems,
    DropIntent,
    flattenTree,
    moveTreeItemWithIntent,
} from '@/components/sortable-tree/utils';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

export interface SortableTreeOptions<T extends TreeItem> {
    queryKey: readonly string[];
    queryFn: () => Promise<T[]>;
    mutateFn: (data: { activeId: UniqueIdentifier; intent: DropIntent }) => Promise<T[]>;
    indentationWidth?: number;
}

export const useSortableTree = <T extends TreeItem>(options: SortableTreeOptions<T>) => {
    const { queryKey, queryFn, mutateFn, indentationWidth = 30 } = options;
    const queryClient = useQueryClient();
    const { expandedIds, toggleExpandedId } = useSortableTreeUIStore(queryKey);

    // Server state - React Query manages this
    const {
        data: items = [],
        isLoading,
        error,
    } = useQuery({
        queryKey,
        queryFn,
    });

    // Computed state - derived from server state + client state
    const flattenedItems = useMemo(() => flattenTree(items, expandedIds), [items, expandedIds]);

    // Move mutation with optimistic updates
    const moveMutation = useMutation({
        mutationFn: mutateFn,
        onMutate: async ({ activeId, intent }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey });

            // Snapshot previous value
            const previousItems = queryClient.getQueryData<T[]>(queryKey);

            // Optimistically update cache
            if (previousItems) {
                const newItems = moveTreeItemWithIntent(previousItems, activeId, intent);
                queryClient.setQueryData(queryKey, newItems);
            }

            // Return context for rollback
            return { previousItems };
        },
        onError: (err, _variables, context) => {
            // Rollback on error
            if (context?.previousItems) {
                queryClient.setQueryData(queryKey, context.previousItems);
            }
            console.error('Move failed, rolling back:', err);
        },
        onSuccess: (data) => {
            // Update with server response if available
            if (data) {
                queryClient.setQueryData(queryKey, data);
            }
        },
    });

    /**
     * Optimistic move handler
     * @param newItems - The new items to move
     */
    const handleOptimisticMove = useCallback(
        (newItems: FlattenedItem<T>[]) => {
            // Build the tree from the new items
            const tree = buildTreeFromFlattenedItems<T>(newItems);

            // Optimistic update to the cache
            queryClient.setQueryData(queryKey, tree);

            // TODO: Implement actual mutation call here
            // This would need to be connected to the actual mutation
            // For now, we're just doing optimistic updates
        },
        [queryClient, queryKey]
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
        handleOptimisticMove,
        toggleExpandedId,

        // Mutation state
        isMoving: moveMutation.isPending,
        moveError: moveMutation.error,

        // Configuration
        indentationWidth,
    };
};
