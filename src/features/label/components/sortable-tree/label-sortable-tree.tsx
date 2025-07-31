'use client';

import { SortableTree, useSortableTreeUIStore } from '@/components/sortable-tree';
import { TLabelService } from '@/features/label/schemas';
import { cn } from '@/lib/utils';
import { LabelTreeItem } from './label-tree-item';
import { labelsToTree } from './utils';

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
                        const response = await fetch('/api/labels');
                        const labels: TLabelService['select'][] = await response.json();
                        return labelsToTree(labels);
                    },
                    mutateFn: async ({ activeId, intent }) => {
                        // TODO: Implement proper mutation based on the intent
                        // For now, return the same data (this would be the reorder API call)
                        console.log('Label move:', { activeId, intent });

                        // This would call the reorder API in a real implementation
                        // await labelEndpoints.reorder.mutateAsync({ updates: ... });
                        const response = await fetch('/api/labels');
                        const labels: TLabelService['select'][] = await response.json();
                        return labelsToTree(labels);
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
