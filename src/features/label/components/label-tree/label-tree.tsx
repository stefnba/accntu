'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { memo, useMemo } from 'react';
import { useLabelEndpoints } from '../../api';
import { LabelTreeProvider } from './provider';

// Types
export interface LabelTreeProps {
    className?: string;
    onSelect?: (labelId: string) => void;
    children?: React.ReactNode;
}

/**
 * Label tree component.
 * Responsible for rendering the label tree container, data fetching and providing the context to the label tree items.
 */
export const LabelTree = memo(function LabelTree({
    className,
    onSelect,
    children,
}: LabelTreeProps) {
    const { data: labels, isLoading } = useLabelEndpoints.getRoots({});

    const rootLabels = useMemo(() => labels || [], [labels]);

    if (isLoading) {
        return (
            <div className="p-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                <span className="ml-2">Loading labels...</span>
            </div>
        );
    }

    if (rootLabels.length === 0) {
        return (
            <Card className={cn('text-center py-8 text-gray-500', className)}>
                <div className="space-y-2">
                    <p>No labels found.</p>
                    <p className="text-sm">Create your first label to get started.</p>
                </div>
            </Card>
        );
    }

    return (
        <div className={cn('space-y-1', className)} role="tree" aria-label="Label tree">
            {rootLabels.map((label) => (
                <LabelTreeProvider key={label.id} label={label} onSelect={onSelect}>
                    {children}
                </LabelTreeProvider>
            ))}
        </div>
    );
});
