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
    // Remove the # if it exists
    const color = hexColor.replace('#', '');

    // Convert to RGB
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);

    // Calculate brightness using luminance formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return black for light colors, white for dark colors
    return brightness > 128 ? '#000000' : '#ffffff';
};
