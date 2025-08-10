import { useSortableTreeUIStore } from '@/components/sortable-tree/store';
import {
    FlattenedItem,
    FlattenedTreeItemBase,
    SortableTreeOptions,
} from '@/components/sortable-tree/types';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

/**

 */

/**
 * Hook for managing a sortable tree
 * Options for the sortable tree
 * @param storeKey - The key for the store
 * @param queryKey - The key for the query
 * @param data - The data for the tree, if not provided, the query data will be used
 * @param onDragEnd - The function to call when the tree is dragged
 * @param indentationWidth - The width of the indentation
 * @param queryFn - The function to call to fetch the data, if not provided, the query data will be used
 */
export const useSortableTree = <D extends FlattenedTreeItemBase>(
    options: SortableTreeOptions<D>
) => {
    const { storeKey, queryKey, data: _, onDragEnd, indentationWidth = 30 } = options;
    const queryClient = useQueryClient();
    const { expandedIds, toggleExpandedId } = useSortableTreeUIStore(storeKey ?? queryKey);

    // Extract the raw items from the query cache
    // the data props is only used for type safety
    const rawItems = queryClient.getQueryData<D[]>(queryKey);

    // Filter out items that are not expanded
    const treeItems = useMemo(() => {
        if (!rawItems) return [];

        // Create item map once for efficient parent lookups
        const itemMap = new Map<string, FlattenedItem<D>>();
        rawItems.forEach((rawItem) => {
            itemMap.set(rawItem.id as string, rawItem);
        });

        const _filteredItems = rawItems.filter((item) => {
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

        return _filteredItems;
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

            console.log(111, queryKey);

            // Execute the actual mutation
            if (onDragEnd) {
                try {
                    await onDragEnd(newItems);

                    // If the mutation returns new items, update the query data
                    // if (result) {
                    //     queryClient.setQueryData(queryKey, result);
                    // }
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
        // isLoading,
        // error,

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
