'use client';

import { cn } from '@/lib/utils';
import { isValidElement, ReactNode, Suspense, useMemo } from 'react';
import { TabComponent, TTabItem, UseTabNavReturn } from './types';

/**
 * Props for tab content component
 * @param tabNav - The tab nav to use
 * @param components - The components to use
 * @param componentProps - Shared props for all components
 * @param lazy - Whether to lazy load the components
 * @param fallback - The fallback to use
 * @param className - The class name to use
 * @param suspenseFallback - The suspense fallback to use
 */
export type QueryStateTabsContentProps<T extends readonly TTabItem[]> = {
    tabs: UseTabNavReturn<T>;
    components: Record<T[number]['value'], TabComponent>;
    lazy?: boolean;
    fallback?: ReactNode;
    className?: string;
    suspenseFallback?: ReactNode;
};

const SuspenseFallback = () => {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
};

const NoContentFallback = () => {
    return <div className="p-4 text-muted-foreground">No content available</div>;
};

/**
 * TabContent component that works directly with the local useTabNav hook
 * Provides lazy-loaded content with performance optimizations
 */
export const QueryStateTabsContent = <T extends readonly TTabItem[]>({
    tabs,
    components,
    lazy = true,
    fallback = <NoContentFallback />,
    className,
    suspenseFallback = <SuspenseFallback />,
}: QueryStateTabsContentProps<T>) => {
    const activeComponent = components[tabs.currentTab];

    const renderComponent = useMemo((): ReactNode => {
        if (!activeComponent) {
            return fallback;
        }

        // For lazy loading, wrap in Suspense if enabled
        if (lazy && isValidElement(activeComponent)) {
            return (
                <Suspense fallback={suspenseFallback}>
                    {activeComponent}
                </Suspense>
            );
        }

        // Return the ReactNode directly
        return activeComponent;
    }, [activeComponent, lazy, suspenseFallback, fallback]);

    return <div className={cn('w-full', className)}>{renderComponent}</div>;
};
