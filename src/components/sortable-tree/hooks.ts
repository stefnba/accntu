import { useSortableTreeUIStore } from '@/components/sortable-tree/store';
import {
    FlattenedItem,
    FlattenedTreeItemBase,
    SortableTreeOptions,
} from '@/components/sortable-tree/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

export const useSortableTree = <D extends FlattenedTreeItemBase>(
    options: SortableTreeOptions<D>
) => {
    const { queryKey, queryFn, mutateFn, indentationWidth = 30 } = options;
    const queryClient = useQueryClient();
    const { expandedIds, toggleExpandedId } = useSortableTreeUIStore(queryKey);

    // Server state - React Query manages this (already flattened)
    const {
        data: rawItems = [],
        isLoading,
        error,
    } = useQuery({
        queryKey,
        queryFn,
    });

    // Filter out items that are not expanded
    const treeItems = useMemo(
        () =>
            rawItems.filter((item) => {
                // Root items (no parent) are always visible
                if (!item.parentId) return true;

                if (expandedIds.has(item.parentId)) {
                    return true;
                }

                return false;
            }),
        [rawItems, expandedIds]
    );

    /**
     * Optimistic move handler
     * @param newItems - The new flattened items after move
     */
    const handleOptimisticMove = useCallback(
        async (newItems: FlattenedItem<D>[]) => {
            // Store current state for potential rollback
            const previousData = queryClient.getQueryData(queryKey);

            // Optimistic update
            queryClient.setQueryData(queryKey, newItems);

            // Execute the actual mutation
            if (mutateFn) {
                try {
                    const result = await mutateFn(newItems);
                    // Update with fresh server response
                    // queryClient.setQueryData(queryKey, result);
                } catch (error) {
                    console.error('Reorder mutation failed:', error);
                    // Revert to previous state on failure
                    // if (previousData) {
                    //     queryClient.setQueryData(queryKey, previousData);
                    // }
                    // throw error;
                }
            }
        },
        [queryClient, queryKey, mutateFn]
    );

    return {
        // server data
        items: rawItems,
        isLoading,
        error,

        // processed items
        treeItems,

        // expanded state
        expandedIds,

        // actions
        handleOptimisticMove,
        toggleExpandedId,

        // configuration
        indentationWidth,
    };
};
