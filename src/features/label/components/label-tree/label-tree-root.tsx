'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { memo } from 'react';

// Types
export interface LabelTreeRootProps extends React.ComponentProps<'div'> {
    children?: React.ReactNode;
}

/**
 * Label tree root component.
 * Provides the main container styling for the label tree.
 */
export const LabelTreeRoot = memo(function LabelTreeRoot({
    className,
    children,
}: LabelTreeRootProps) {
    return (
        <Card data-slot="label-tree-root" className={cn('space-y-1', className)}>
            <CardContent>{children}</CardContent>
        </Card>
    );
});
