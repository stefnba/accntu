'use client';

import {
    FlattenedItem,
    SortableTree,
    SortableTreeOptions,
    TreeItem,
    useSortableTreeUIStore,
} from '@/components/sortable-tree';
import { Button } from '@/components/ui/button';
import { TLabelService } from '@/features/label/schemas';
import { cn } from '@/lib/utils';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

// Extend TreeItem with label-specific properties
interface LabelTreeItem extends TreeItem {
    name: string;
    color?: string | null;
    icon?: string | null;
    imageUrl?: string | null;
    parentId?: string | null;
    sortOrder: number;
    userId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Transform label to tree item
const labelToTreeItem = (
    label: TLabelService['select'],
    allLabels: TLabelService['select'][]
): LabelTreeItem => {
    const children = allLabels
        .filter((l) => l.parentId === label.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((child) => labelToTreeItem(child, allLabels));

    return {
        id: label.id,
        name: label.name,
        color: label.color,
        icon: label.icon,
        imageUrl: label.imageUrl,
        parentId: label.parentId,
        sortOrder: label.sortOrder,
        userId: label.userId,
        isActive: label.isActive,
        createdAt: label.createdAt,
        updatedAt: label.updatedAt,
        children,
    };
};

// Transform labels to tree structure
const labelsToTree = (labels: TLabelService['select'][]): LabelTreeItem[] => {
    // Get root labels (those without a parent)
    const rootLabels = labels
        .filter((label) => !label.parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder);

    return rootLabels.map((root) => labelToTreeItem(root, labels));
};

interface LabelSortableTreeProps {
    className?: string;
}

export const LabelSortableTree = ({ className }: LabelSortableTreeProps) => {
    // Transform the flat labels into tree structure
    const options: SortableTreeOptions<LabelTreeItem> = useMemo(
        () => ({
            queryKey: ['labels'],
            queryFn: async (): Promise<LabelTreeItem[]> => {
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
    const renderLabelItem = (item: FlattenedItem<LabelTreeItem>, dragButton: React.ReactNode) => {
        return <LabelTreeItemRenderer item={item} dragButton={dragButton} />;
    };

    return (
        <div className={cn('w-full', className)}>
            <SortableTree options={options}>{renderLabelItem}</SortableTree>
        </div>
    );
};

interface LabelTreeItemRendererProps {
    item: FlattenedItem<LabelTreeItem>;
    dragButton: React.ReactNode;
}

const LabelTreeItemRenderer = ({ item, dragButton }: LabelTreeItemRendererProps) => {
    // Get expand state from the same store instance used by the tree
    const { expandedIds, toggleExpandedId } = useSortableTreeUIStore(['labels']);
    const isExpanded = expandedIds.has(item.id);

    const toggleExpanded = () => {
        toggleExpandedId(item.id);
    };

    return (
        <div
            className={cn(
                'border w-full p-3 rounded-md flex gap-2 items-center bg-white hover:bg-gray-50 transition-colors'
            )}
        >
            {/* Collapse/Expand button */}
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    'w-6 h-6 p-0 flex items-center justify-center',
                    !item.hasChildren && 'invisible'
                )}
                onClick={toggleExpanded}
                disabled={!item.hasChildren}
            >
                {item.hasChildren &&
                    (isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                    ) : (
                        <ChevronRight className="w-4 h-4" />
                    ))}
            </Button>

            {/* Drag handle */}
            {dragButton}

            {/* Label content */}
            <div className="flex-1 flex items-center gap-2">
                {/* Color indicator */}
                {item.color && (
                    <div
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: item.color }}
                    />
                )}

                {/* Label name */}
                <span className="font-medium">{item.name}</span>

                {/* Children count */}
                {item.hasChildren && !isExpanded && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {item.childrenCount} items
                    </span>
                )}
            </div>
        </div>
    );
};
