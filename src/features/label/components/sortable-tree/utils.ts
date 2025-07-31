import { TLabelService } from '@/features/label/schemas';
import { TLabelTreeItem } from './types';

/**
 * Transform a single label to tree item with nested children
 * @param label - The label to transform
 * @param allLabels - All labels for finding children
 * @returns Transformed tree item with children
 */
export const labelToTreeItem = (
    label: TLabelService['select'],
    allLabels: TLabelService['select'][]
): TLabelTreeItem => {
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

/**
 * Transform flat labels array to hierarchical tree structure
 * @param labels - Flat array of labels
 * @returns Hierarchical tree structure
 */
export const labelsToTree = (labels: TLabelService['select'][]): TLabelTreeItem[] => {
    // Get root labels (those without a parent)
    const rootLabels = labels
        .filter((label) => !label.parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder);

    return rootLabels.map((root) => labelToTreeItem(root, labels));
};
