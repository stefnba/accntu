'use client';

import { cn } from '@/lib/utils';
import { ComponentType, createElement, isValidElement, ReactNode, Suspense } from 'react';
import { TTabItem, UseTabNavReturn } from './types';

/**
 * Props for tab content component
 * @param tabNav - The tab nav to use
 * @param components - The components to use
 * @param lazy - Whether to lazy load the components
 * @param fallback - The fallback to use
 * @param className - The class name to use
 * @param suspenseFallback - The suspense fallback to use
 */
export type QueryStateTabsContentProps<T extends readonly TTabItem[]> = {
    tabs: UseTabNavReturn<T>;
    components: Record<T[number]['value'], ComponentType<TTabItem> | ReactNode>;
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
    lazy = false,
    fallback = <NoContentFallback />,
    className,
    suspenseFallback = <SuspenseFallback />,
}: QueryStateTabsContentProps<T>) => {
    const activeComponent = components[tabs.currentTab];

    if (!activeComponent) {
        return fallback;
    }

    const renderComponent = (): ReactNode => {
        // If it's already a ReactNode (JSX element), return it directly
        if (
            isValidElement(activeComponent) ||
            typeof activeComponent === 'string' ||
            typeof activeComponent === 'number'
        ) {
            return activeComponent as ReactNode;
        }

        // If it's a component type, create an element with props
        if (typeof activeComponent === 'function') {
            const props = { ...tabs.getTab(tabs.currentTab) };

            if (lazy) {
                return (
                    <Suspense fallback={suspenseFallback}>
                        {createElement(activeComponent, props)}
                    </Suspense>
                );
            }

            return createElement(activeComponent, props);
        }

        // Fallback for any other ReactNode types
        return activeComponent as ReactNode;
    };

    return <div className={cn('w-full', className)}>{renderComponent()}</div>;
};
