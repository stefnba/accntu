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
    const { queryKey, queryFn, onDragEnd, indentationWidth = 30 } = options;
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
    const treeItems = useMemo(() => {
        // Create item map once for efficient parent lookups
        const itemMap = new Map<string, FlattenedItem<D>>();
        rawItems.forEach((rawItem) => {
            itemMap.set(rawItem.id as string, rawItem);
        });

        return rawItems.filter((item) => {
            // Root items (no parent) are always visible
            if (!item.parentId) return true;

            // Check that ALL ancestors are expanded
            let currentParentId: string | null = item.parentId;
            while (currentParentId) {
                // If any ancestor is not expanded, hide this item
                if (!expandedIds.has(currentParentId)) {
                    return false;
                }

                // Move up to the next ancestor
                const parent = itemMap.get(currentParentId);
                currentParentId = parent?.parentId ?? null;
            }

            // All ancestors are expanded
            return true;
        });
    }, [rawItems, expandedIds]);

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
            if (onDragEnd) {
                try {
                    const result = await onDragEnd(newItems);

                    // If the mutation returns new items, update the query data
                    if (result) {
                        queryClient.setQueryData(queryKey, result);
                    }
                } catch (error) {
                    console.error('Reorder mutation failed:', error);
                    // Revert to previous state on failure
                    if (previousData) {
                        queryClient.setQueryData(queryKey, previousData);
                    }
                    throw error;
                }
            }
        },
        [queryClient, queryKey, onDragEnd]
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
