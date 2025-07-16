import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { TTabItem } from './types';

export type TTabNavHookOptions<T extends readonly TTabItem[]> = {
    /**
     * The query state key to use for the tab nav.
     */
    key?: string;
    /**
     * The tabs to use for the tab nav.
     */
    tabs: T;
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
    getTab: (value: T[number]['value']) => TTabItem;
};

/**
 * A hook to manage a tab nav.
 * @param key - The query state key to use for the tab nav.
 * @param tabs - The tabs to use for the tab nav, e.g. 'details', 'banking', 'amount', 'metadata'.
 * @param defaultTab - The default tab to use for the tab nav.
 * @returns An object with the current tab, reset function, setTab function, and tabs array.
 */
export const useQueryStateTabsNav = <T extends readonly TTabItem[]>(
    options: TTabNavHookOptions<T>
): UseTabNavReturn<T> => {
    const [currentTab, setCurrentTab] = useQueryState<T[number]['value']>(
        options.key || 'v',
        parseAsStringLiteral(options.tabs.map((tab) => tab.value)).withDefault(
            options.defaultTab || options.tabs[0].value
        )
    );

    const setTab = (tab: T[number]['value']) => {
        setCurrentTab(tab);
    };

    const resetToDefault = () => {
        setCurrentTab(options.defaultTab || options.tabs[0].value);
    };

    const getTab = (value: T[number]['value']) => {
        const tab = options.tabs.find((tab) => tab.value === value);
        if (!tab) {
            throw new Error(`Tab ${value} not found`);
        }
        return tab;
    };

    return {
        currentTab,
        resetToDefault,
        setTab,
        tabs: options.tabs,
        getTab,
    };
};

/**
 * Infer the query state tab nav hook options
 * @param T - The type of the tab nav hook options
 * @returns The query state tab nav hook options
 */
export type InferQueryStateTabNavHookOptions<
    T extends (...args: any[]) => { tabs: readonly TTabItem[] },
> = ReturnType<T>['tabs'][number];
