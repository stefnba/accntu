import { type Tag } from './server/db/schema';

// Extended types for hierarchy
export interface TagWithChildren extends Tag {
    children?: TagWithChildren[];
}

// Tag utility functions
export const buildTagHierarchy = (tags: Tag[]): TagWithChildren[] => {
    const rootTags = tags.filter((tag) => !tag.parentTagId);
    const childTags = tags.filter((tag) => tag.parentTagId);

    const addChildren = (parentTag: Tag): TagWithChildren => {
        const children = childTags.filter((child) => child.parentTagId === parentTag.id);
        return {
            ...parentTag,
            children: children.map(addChildren),
        };
    };

    return rootTags.map(addChildren);
};

export const flattenTagHierarchy = (tags: Tag[]): Tag[] => {
    const flattened: Tag[] = [];

    const addTag = (tag: Tag & { children?: Tag[] }) => {
        flattened.push(tag);
        if (tag.children) {
            tag.children.forEach(addTag);
        }
    };

    tags.forEach(addTag);
    return flattened;
};

export const getTagPath = (tag: Tag, allTags: Tag[]): string[] => {
    const path: string[] = [tag.name];

    let currentTag = tag;
    while (currentTag.parentTagId) {
        const parent = allTags.find((t) => t.id === currentTag.parentTagId);
        if (!parent) break;
        path.unshift(parent.name);
        currentTag = parent;
    }

    return path;
};

export const getTagDepth = (tag: Tag, allTags: Tag[]): number => {
    let depth = 0;
    let currentTag = tag;

    while (currentTag.parentTagId) {
        const parent = allTags.find((t) => t.id === currentTag.parentTagId);
        if (!parent) break;
        depth++;
        currentTag = parent;
    }

    return depth;
};

// Auto-tagging utility functions
export const shouldAutoTag = (transactionDescription: string, tagRules: string[]): boolean => {
    if (!tagRules || tagRules.length === 0) return false;

    const description = transactionDescription.toLowerCase();

    return tagRules.some((rule) => {
        const rulePattern = rule.toLowerCase();

        // Check if it's a regex pattern (starts and ends with /)
        if (rulePattern.startsWith('/') && rulePattern.endsWith('/')) {
            try {
                const regex = new RegExp(rulePattern.slice(1, -1), 'i');
                return regex.test(description);
            } catch {
                // If regex is invalid, fall back to string matching
                return description.includes(rulePattern.slice(1, -1));
            }
        }

        // Simple string matching
        return description.includes(rulePattern);
    });
};

export const calculateAutoTagConfidence = (
    transactionDescription: string,
    tagRules: string[]
): 'high' | 'medium' | 'low' => {
    const description = transactionDescription.toLowerCase();
    let matchCount = 0;
    let exactMatch = false;

    tagRules.forEach((rule) => {
        const rulePattern = rule.toLowerCase();

        if (rulePattern.startsWith('/') && rulePattern.endsWith('/')) {
            try {
                const regex = new RegExp(rulePattern.slice(1, -1), 'i');
                if (regex.test(description)) {
                    matchCount++;
                    // Check if it's an exact word match
                    if (new RegExp(`\\b${rulePattern.slice(1, -1)}\\b`, 'i').test(description)) {
                        exactMatch = true;
                    }
                }
            } catch {
                if (description.includes(rulePattern.slice(1, -1))) {
                    matchCount++;
                }
            }
        } else {
            if (description.includes(rulePattern)) {
                matchCount++;
                // Check if it's an exact word match
                if (new RegExp(`\\b${rulePattern}\\b`, 'i').test(description)) {
                    exactMatch = true;
                }
            }
        }
    });

    if (exactMatch || matchCount >= 2) return 'high';
    if (matchCount === 1) return 'medium';
    return 'low';
};

// Tag validation utilities
export const validateTagName = (
    name: string,
    existingTags: Tag[],
    excludeId?: string
): string | null => {
    if (!name.trim()) return 'Tag name is required';
    if (name.length > 100) return 'Tag name must be 100 characters or less';

    const isDuplicate = existingTags.some(
        (tag) => tag.name.toLowerCase() === name.toLowerCase() && tag.id !== excludeId
    );

    if (isDuplicate) return 'A tag with this name already exists';

    return null;
};

export const validateTagHierarchy = (
    parentId: string,
    childId: string,
    allTags: Tag[]
): string | null => {
    // Check if parent is a descendant of child (would create circular reference)
    const isDescendant = (potentialParentId: string, potentialChildId: string): boolean => {
        const parent = allTags.find((tag) => tag.id === potentialParentId);
        if (!parent) return false;

        if (parent.parentTagId === potentialChildId) return true;
        if (parent.parentTagId) return isDescendant(parent.parentTagId, potentialChildId);

        return false;
    };

    if (isDescendant(parentId, childId)) {
        return 'Cannot create circular hierarchy';
    }

    return null;
};

// Color utility functions
export const generateTagColor = (): string => {
    const colors = [
        '#6366f1',
        '#8b5cf6',
        '#a855f7',
        '#d946ef',
        '#ec4899',
        '#f43f5e',
        '#ef4444',
        '#f97316',
        '#f59e0b',
        '#eab308',
        '#84cc16',
        '#22c55e',
        '#10b981',
        '#14b8a6',
        '#06b6d4',
        '#0ea5e9',
        '#3b82f6',
        '#6366f1',
        '#8b5cf6',
        '#a855f7',
    ];

    return colors[Math.floor(Math.random() * colors.length)];
};

export const getContrastTextColor = (hexColor: string): string => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#000000' : '#ffffff';
};
