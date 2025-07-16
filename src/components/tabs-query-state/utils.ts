import { ComponentType, ReactNode } from 'react';
import { TTabItem } from './types';

// Create tab views from a simple configuration object
export const createTabViews = <T extends Record<string, { label: string; icon?: ReactNode }>>(
    views: T
) => {
    return Object.entries(views).map(([value, { label, icon }]) => ({
        value,
        label,
        icon,
    })) satisfies Array<{
        value: keyof T;
        label: string;
        icon?: ReactNode;
    }>;
};

// Create a complete tab setup from separate views and components
export const createCompleteTabSetup = <
    TViews extends Record<string, { label: string; icon?: ReactNode }>,
    TComponents extends Record<keyof TViews, ComponentType<{ viewKey: keyof TViews }>>,
>(
    views: TViews,
    components: TComponents
) => {
    const tabs = createTabViews(views);

    return {
        tabs,
        components,
        views,
    };
};

// Type guard for tab items
export const isTabItem = (item: unknown): item is TTabItem => {
    if (typeof item !== 'object' || item === null) {
        return false;
    }
    
    const candidate = item as Record<string, unknown>;
    return (
        typeof candidate.label !== 'undefined' &&
        typeof candidate.value === 'string'
    );
};

// Utility to find active tab (memoized for performance)
export const findActiveTab = <T extends readonly TTabItem[]>(
    tabs: T,
    activeValue: T[number]['value']
): T[number] | undefined => {
    return tabs.find((tab) => tab.value === activeValue);
};
