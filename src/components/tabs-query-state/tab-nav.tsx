'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCallback } from 'react';
import { TTabItem, UseTabNavReturn } from './types';

/**
 * Props for tab navigation component - minimal, just functionality
 * @param tabs - The tabs to use
 * @param className - The class name to use
 * @param render - The render function to use
 */
type QueryStateTabsNavProps<T extends readonly TTabItem[]> = {
    tabsNav: UseTabNavReturn<T>;
    className?: string;
    render?: (props: {
        tabs: T;
        activeTab: T[number]['value'];
        onTabChange: (tab: T[number]['value']) => void;
        Tab: React.ComponentType<
            Omit<React.ComponentProps<typeof TabsTrigger>, 'value'> & { value: T[number]['value'] }
        >;
    }) => React.ReactNode;
};

export const QueryStateTabsNav = <T extends readonly TTabItem[]>({
    tabsNav,
    className,
    render,
}: QueryStateTabsNavProps<T>) => {
    const handleValueChange = useCallback((newValue: string) => {
        const validTab = tabsNav.tabs.find(tab => tab.value === newValue);
        if (validTab) {
            tabsNav.setTab(validTab.value);
        }
    }, [tabsNav]);

    // Custom render function - needs Tabs wrapper
    if (render) {
        return (
            <Tabs value={tabsNav.currentTab} onValueChange={handleValueChange} className={className}>
                <TabsList>
                    {render({
                        tabs: tabsNav.tabs,
                        activeTab: tabsNav.currentTab,
                        onTabChange: tabsNav.setTab,
                        Tab: TabsTrigger,
                    })}
                </TabsList>
            </Tabs>
        );
    }

    // Default render
    return (
        <Tabs value={tabsNav.currentTab} onValueChange={handleValueChange} className={className}>
            <TabsList>
                {tabsNav.tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.icon && <span className="mr-2">{tab.icon}</span>}
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
};
