import { type TLabel } from './schemas';

// Extended types for hierarchy
export interface LabelWithChildren extends TLabel {
    children?: LabelWithChildren[];
}

// Label utility functions
export const buildLabelHierarchy = (labels: TLabel[]): LabelWithChildren[] => {
    const rootLabels = labels.filter((label) => !label.parentId);
    const childLabels = labels.filter((label) => label.parentId);

    const addChildren = (parentLabel: TLabel): LabelWithChildren => {
        const children = childLabels
            .filter((child) => child.parentId === parentLabel.id)
            .sort((a, b) => a.rank - b.rank);

        return {
            ...parentLabel,
            children: children.map(addChildren),
        };
    };

    return rootLabels.sort((a, b) => a.rank - b.rank).map(addChildren);
};

export const getLabelPath = (label: TLabel, allLabels: TLabel[]): string[] => {
    const path: string[] = [label.name];

    let currentLabel = label;
    while (currentLabel.parentId) {
        const parent = allLabels.find((l) => l.id === currentLabel.parentId);
        if (!parent) break;
        path.unshift(parent.name);
        currentLabel = parent;
    }

    return path;
};

export const getLabelBreadcrumb = (label: TLabel, allLabels: TLabel[]): string => {
    return getLabelPath(label, allLabels).join(' > ');
};

export const validateLabelName = (
    name: string,
    existingLabels: TLabel[],
    excludeId?: string
): string | null => {
    if (!name.trim()) return 'Label name is required';
    if (name.length > 100) return 'Label name must be 100 characters or less';

    const isDuplicate = existingLabels.some(
        (label) => label.name.toLowerCase() === name.toLowerCase() && label.id !== excludeId
    );

    if (isDuplicate) return 'A label with this name already exists';

    return null;
};

export const validateLabelHierarchy = (
    parentId: string,
    childId: string,
    allLabels: TLabel[]
): string | null => {
    // Check if parent is a descendant of child (would create circular reference)
    const isDescendant = (potentialParentId: string, potentialChildId: string): boolean => {
        const parent = allLabels.find((label) => label.id === potentialParentId);
        if (!parent) return false;

        if (parent.parentId === potentialChildId) return true;
        if (parent.parentId) return isDescendant(parent.parentId, potentialChildId);

        return false;
    };

    if (isDescendant(parentId, childId)) {
        return 'Cannot create circular hierarchy';
    }

    return null;
};
