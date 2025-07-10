'use client';

import { Button } from '@/components/ui/button';
import { LabelBadge } from '@/features/label/components/label-badge';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { useLabelTreeContext, useLabelTreeData, useLabelTreeState } from './provider';

export interface LabelTreeItemProps extends React.ComponentProps<'div'> {
    children?: React.ReactNode;
}

/**
 * Label tree item component.
 * Responsible for rendering the container for the label tree item.
 */
export const LabelTreeItem = memo(function LabelTreeItem({
    className,
    children,
}: LabelTreeItemProps) {
    const { currentLabel } = useLabelTreeData();

    if (!currentLabel) return null;

    return (
        <div data-slot="label-tree-item" className={cn('space-y-1', className)}>
            {children}
        </div>
    );
});

/**
 * Label tree item content component.
 * Provides the layout container for label content with hover effects.
 */
export const LabelTreeItemContent = memo(function LabelTreeItemContent({
    className,
    children,
}: React.ComponentProps<'div'>) {
    const { currentLevel } = useLabelTreeData();

    return (
        <div
            data-slot="label-tree-item-content"
            className={cn(
                'flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 group',
                currentLevel > 0 && 'ml-6',
                className
            )}
        >
            {children}
        </div>
    );
});

/**
 * Label tree item expand/collapse button.
 * Handles the expand/collapse functionality for tree items with children.
 */
export const LabelTreeItemButton = memo(function LabelTreeItemButton({
    className,
}: React.ComponentProps<'button'>) {
    const { currentLabel } = useLabelTreeData();
    const { toggleExpandedLabelId, isExpandedLabelId } = useLabelTreeState();

    if (!currentLabel) return null;

    const hasChildren = useMemo(
        () => Boolean(currentLabel.children && currentLabel.children.length > 0),
        [currentLabel.children]
    );

    const expanded = isExpandedLabelId(currentLabel.id);

    const handleClick = useCallback(() => {
        toggleExpandedLabelId(currentLabel.id);
    }, [currentLabel.id, toggleExpandedLabelId]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleExpandedLabelId(currentLabel.id);
            }
            if (e.key === 'ArrowRight' && !expanded && hasChildren) {
                e.preventDefault();
                toggleExpandedLabelId(currentLabel.id);
            }
            if (e.key === 'ArrowLeft' && expanded && hasChildren) {
                e.preventDefault();
                toggleExpandedLabelId(currentLabel.id);
            }
        },
        [currentLabel.id, toggleExpandedLabelId, expanded, hasChildren]
    );

    return (
        <Button
            data-slot="label-tree-item-button"
            variant="ghost"
            size="icon"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            aria-expanded={hasChildren ? expanded : undefined}
            aria-label={hasChildren ? (expanded ? 'Collapse' : 'Expand') : undefined}
            tabIndex={hasChildren ? 0 : -1}
            className={cn('flex-shrink-0 w-4 h-4 flex items-center justify-center', className)}
        >
            {hasChildren ? (
                expanded ? (
                    <ChevronDown className="w-3 h-3" />
                ) : (
                    <ChevronRight className="w-3 h-3" />
                )
            ) : (
                <div className="w-3 h-3" />
            )}
        </Button>
    );
});

/**
 * Label tree item badge component.
 * Displays the label badge with optional selection functionality.
 */
export const LabelTreeItemBadge = memo(function LabelTreeItemBadge({
    className,
}: React.ComponentProps<'div'>) {
    const { currentLabel } = useLabelTreeData();
    const { onSelect } = useLabelTreeContext();

    if (!currentLabel) return null;

    const handleSelect = useCallback(() => {
        onSelect?.(currentLabel.id);
    }, [currentLabel.id, onSelect]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
                e.preventDefault();
                onSelect(currentLabel.id);
            }
        },
        [currentLabel.id, onSelect]
    );

    if (onSelect) {
        return (
            <Button
                data-slot="label-tree-item-badge"
                variant="ghost"
                size="sm"
                onClick={handleSelect}
                onKeyDown={handleKeyDown}
                aria-label={`Select ${currentLabel.name}`}
                className={className}
            >
                <LabelBadge label={currentLabel} />
            </Button>
        );
    }

    return (
        <div data-slot="label-tree-item-badge" className={className}>
            <LabelBadge label={currentLabel} />
        </div>
    );
});
