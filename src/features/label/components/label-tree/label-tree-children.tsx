'use client';

import { cn } from '@/lib/utils';
import { memo, useMemo } from 'react';
import { LabelTreeProvider, useLabelTreeData, useLabelTreeState } from './provider';

// Types
export interface LabelTreeChildrenProps extends React.ComponentProps<'div'> {
    children?: React.ReactNode;
}

/**
 * Label tree children component.
 * Responsible for rendering child labels recursively.
 */
export const LabelTreeChildren = memo(function LabelTreeChildren({
    className,
    children,
}: LabelTreeChildrenProps) {
    const { currentLabel, currentLevel } = useLabelTreeData();
    const { isExpandedLabelId } = useLabelTreeState();

    if (!currentLabel) return null;

    const hasChildren = useMemo(
        () => Boolean(currentLabel.children && currentLabel.children.length > 0),
        [currentLabel.children]
    );

    const expanded = isExpandedLabelId(currentLabel.id);

    const childLabels = useMemo(() => currentLabel.children || [], [currentLabel.children]);

    if (!hasChildren || !expanded) {
        return null;
    }

    return (
        <div className={cn('ml-14 space-y-1 border-l-1 w-full', className)}>
            {childLabels.map((child) => (
                <LabelTreeProvider key={child.id} label={child} level={currentLevel + 1}>
                    {children}
                </LabelTreeProvider>
            ))}
        </div>
    );
});
