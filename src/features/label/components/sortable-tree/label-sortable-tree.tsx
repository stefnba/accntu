'use client';

import { SortableTree, useSortableTreeUIStore } from '@/components/sortable-tree';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';
import { LabelTreeItem } from './label-tree-item';

interface LabelSortableTreeProps {
    className?: string;
}

const KEY = ['labels'];

/**
 * Main sortable tree component for labels with drag & drop functionality
 */
export const LabelSortableTree = ({ className }: LabelSortableTreeProps) => {
    // Get expand state at component level (not inside render function)
    const { expandedIds, toggleExpandedId } = useSortableTreeUIStore(KEY);

    return (
        <div className={cn('w-full', className)}>
            <SortableTree
                options={{
                    queryKey: KEY,
                    queryFn: async () => {
                        const response = await apiClient.labels.flattened.$get();
                        if (!response.ok) {
                            throw new Error('Failed to fetch labels');
                        }

                        const labels = await response.json();
                        return labels;
                    },
                    mutateFn: async (reorderedItems) => {
                        console.log(
                            'Reordering labels:',
                            reorderedItems.map((item) => ({
                                id: item.id,
                                index: item.index,
                                parentId: item.parentId,
                                globalIndex: item.globalIndex,
                                name: item.name,
                            }))
                        );

                        await apiClient.labels.reorder.$put({
                            json: { items: reorderedItems },
                        });

                        // if (!response.ok) {
                        //     throw new Error('Failed to reorder labels');
                        // }

                        // const result = await response.json();
                        // return result.labels;

                        // if (!response.ok) {
                        //     throw new Error('Failed to reorder labels');
                        // }

                        // const result = await response.json();
                        // return result.labels;
                    },
                }}
                renderItem={(item, dragButton) => (
                    <LabelTreeItem
                        item={item}
                        dragButton={dragButton}
                        isExpanded={expandedIds.has(item.id)}
                        onToggleExpanded={toggleExpandedId}
                    />
                )}
            />
        </div>
    );
};
