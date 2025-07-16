'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    const handleValueChange = (newValue: string) => {
        const isValidValue = (val: string): val is T[number]['value'] =>
            tabsNav.tabs.some((tab) => tab.value === val);

        if (isValidValue(newValue)) {
            tabsNav.setTab(newValue);
        }
    };

    // Custom render function
    if (render) {
        return (
            <Tabs
                value={tabsNav.currentTab}
                onValueChange={handleValueChange}
                className={className}
            >
                <TabsList className={className}>
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
            <TabsList className={className}>
                {tabsNav.tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.icon && tab.icon}
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
};

export const QueryStateTabsNavOnly = <T extends readonly TTabItem[]>({
    tabsNav,
    className,
}: Omit<QueryStateTabsNavProps<T>, 'render'>) => {
    return (
        <TabsList className={className}>
            {tabsNav.tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.icon && tab.icon}
                    {tab.label}
                </TabsTrigger>
            ))}
        </TabsList>
    );
};
