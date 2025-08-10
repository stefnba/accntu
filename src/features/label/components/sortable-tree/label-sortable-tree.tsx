'use client';

import { SortableTree } from '@/components/sortable-tree';
import { useLabelEndpoints } from '@/features/label/api';
import { LabelTreeItem } from '@/features/label/components/label-tree-item';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface LabelSortableTreeProps {
    className?: string;
}

const KEY = ['labels'];

/**
 * Main sortable tree component for labels with drag & drop functionality
 */
export const LabelSortableTree = ({ className }: LabelSortableTreeProps) => {
    const { mutate: reorderLabels } = useLabelEndpoints.reorder({
        onSuccess: () => {
            toast.success('Labels reordered successfully NEW');
        },
        onError: () => {
            toast.error('Failed to reorder labels');
        },
    });

    const { data: labels } = useLabelEndpoints.getAllFlattened({});

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
                    onDragEnd: async (reorderedItems) => {
                        reorderLabels({
                            json: {
                                items: reorderedItems,
                            },
                        });
                    },
                }}
                renderItem={({ item, dragButton, expandedIds, toggleExpandedId }) => (
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
