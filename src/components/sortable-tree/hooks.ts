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

    // Enhance raw server data with client-side fields and filter by expanded state
    const treeItems = useMemo(() => {
        // Create parent map for ancestry lookups
        const parentMap = new Map<string, D>();
        rawItems.forEach((item) => {
            if (typeof item.id === 'string') {
                parentMap.set(item.id, item);
            }
        });

        const filtered = rawItems.filter((item) => {
            // Root items (no parent) are always visible
            if (!item.parentId) return true;

            if (expandedIds.has(item.parentId)) {
                return true;
            }

            return false;
        });

        return filtered;
    }, [rawItems, expandedIds]);

    /**
     * Optimistic move handler
     * @param newItems - The new flattened items after move
     */
    const handleOptimisticMove = useCallback(
        (newItems: FlattenedItem<D>[]) => {
            // For optimistic updates, we need to update with raw server data format
            // Use the current rawItems as base, since we're just reordering existing items
            queryClient.setQueryData(queryKey, newItems);

            // TODO: Implement actual mutation call here
            // mutateFn(newItems);
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
