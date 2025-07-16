import { ReactNode } from 'react';

/**
 * Tab item type
 * @param label - The label of the tab
 * @param value - The value of the tab
 * @param icon - The icon of the tab
 */
export type TTabItem = {
    label: string | ReactNode;
    value: string;
    icon?: ReactNode;
};

/**
 * Tab component type - simplified to just ReactNode
 */
export type TabComponent = ReactNode;

/**
 * Hook options type with simplified API
 */
export type TTabNavHookOptions<T extends readonly TTabItem[]> = {
    /**
     * The query state key to use for the tab nav.
     */
    key?: string;
    /**
     * The default tab to use for the tab nav.
     */
    defaultTab?: T[number]['value'];
};

/**
 * Type for useTabNav hook return
 */
export type UseTabNavReturn<T extends readonly TTabItem[]> = {
    /**
     * The current tab value.
     */
    currentTab: T[number]['value'];
    /**
     * Set the tab value.
     * @param tab - The tab value to set.
     */
    setTab: (tab: T[number]['value']) => void;
    /**
     * Reset the tab to the default tab.
     */
    resetToDefault: () => void;
    /**
     * The tabs to use for the tab nav.
     */
    tabs: T;
    /**
     * Get a tab by value.
     * @param value - The value of the tab to get.
     * @returns The tab.
     */
    getTab: (value: T[number]['value']) => T[number];
};
