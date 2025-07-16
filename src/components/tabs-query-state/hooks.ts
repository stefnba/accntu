import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useCallback, useMemo } from 'react';
import { TTabItem, TTabNavHookOptions, UseTabNavReturn } from './types';

/**
 * A hook to manage a tab nav with simplified API.
 * @param tabs - The tabs to use for the tab nav, e.g. 'details', 'banking', 'amount', 'metadata'.
 * @param options - Optional configuration (key, defaultTab).
 * @returns An object with the current tab, reset function, setTab function, and tabs array.
 */
export const useQueryStateTabsNav = <T extends readonly TTabItem[]>(
    tabs: T,
    options: TTabNavHookOptions<T> = {}
): UseTabNavReturn<T> => {
    const defaultTab = options.defaultTab || tabs[0].value;
    
    const [currentTab, setCurrentTab] = useQueryState<T[number]['value']>(
        options.key || 'v',
        parseAsStringLiteral(tabs.map((tab) => tab.value)).withDefault(defaultTab)
    );

    const setTab = useCallback((tab: T[number]['value']) => {
        setCurrentTab(tab);
    }, [setCurrentTab]);

    const resetToDefault = useCallback(() => {
        setCurrentTab(defaultTab);
    }, [setCurrentTab, defaultTab]);

    const getTab = useCallback((value: T[number]['value']): T[number] => {
        const tab = tabs.find((tab) => tab.value === value);
        if (!tab) {
            console.warn(`Tab ${value} not found, falling back to default`);
            return tabs[0];
        }
        return tab;
    }, [tabs]);

    const memoizedTabs = useMemo(() => tabs, [tabs]);

    return {
        currentTab,
        resetToDefault,
        setTab,
        tabs: memoizedTabs,
        getTab,
    };
};

/**
 * Infer the query state tab nav hook options
 * @param T - The type of the tab nav hook options
 * @returns The query state tab nav hook options
 */
export type InferQueryStateTabNavHookOptions<
    T extends (...args: never[]) => { tabs: readonly TTabItem[] },
> = ReturnType<T>['tabs'][number];
