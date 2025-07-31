'use client';

import {
    FlattenedItem,
    SortableTree,
    SortableTreeOptions,
    useSortableTreeUIStore,
} from '@/components/sortable-tree';
import { TLabelService } from '@/features/label/schemas';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { LabelTreeItem } from './label-tree-item';
import { TLabelTreeItem } from './types';
import { labelsToTree } from './utils';

/**
 * Props for the main label sortable tree component
 */
interface LabelSortableTreeProps {
    className?: string;
}

/**
 * Main sortable tree component for labels with drag & drop functionality
 */
export const LabelSortableTree = ({ className }: LabelSortableTreeProps) => {
    // Get expand state at component level (not inside render function)
    const { expandedIds, toggleExpandedId } = useSortableTreeUIStore(['labels']);

    // Transform the flat labels into tree structure
    const options: SortableTreeOptions<TLabelTreeItem> = useMemo(
        () => ({
            queryKey: ['labels'],
            queryFn: async (): Promise<TLabelTreeItem[]> => {
                // Use the existing label API to get all labels
                const response = await fetch('/api/labels');
                if (!response.ok) {
                    throw new Error('Failed to fetch labels');
                }
                const labels: TLabelService['select'][] = await response.json();
                return labelsToTree(labels);
            },
            mutateFn: async ({ activeId, intent }) => {
                // TODO: Implement proper mutation based on the intent
                // For now, return the same data (this would be the reorder API call)
                console.log('Label move:', { activeId, intent });

                // This would call the reorder API in a real implementation
                // await labelEndpoints.reorder.mutateAsync({ updates: ... });

                // Return current data for now
                const response = await fetch('/api/labels');
                const labels: TLabelService['select'][] = await response.json();
                return labelsToTree(labels);
            },
        }),
        []
    );

    // Custom label item renderer
    const renderLabelItem = (item: FlattenedItem<TLabelTreeItem>, dragButton: React.ReactNode) => {
        const isExpanded = expandedIds.has(item.id);

        return (
            <LabelTreeItem
                item={item}
                dragButton={dragButton}
                isExpanded={isExpanded}
                onToggleExpanded={toggleExpandedId}
            />
        );
    };

    return (
        <div className={cn('w-full', className)}>
            <SortableTree options={options}>{renderLabelItem}</SortableTree>
        </div>
    );
};
