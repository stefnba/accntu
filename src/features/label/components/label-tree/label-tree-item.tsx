'use client';

import { Button } from '@/components/ui/button';
import { LabelBadge } from '@/features/label/components/label-badge';
import { cn } from '@/lib/utils';
import { renderLabelIcon } from '@/lib/utils/icon-renderer';
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
    const { currentLabel, currentLevel } = useLabelTreeData();

    if (!currentLabel) return null;

    return (
        <div
            data-slot="label-tree-item"
            className={cn(
                'space-y-1 flex flex-wrap items-center',
                currentLevel > 0 && 'ml-4',
                className
            )}
        >
            {children}
        </div>
    );
});

export const LabelTreeItemHeader = memo(function LabelTreeItemHeader({
    className,
    children,
}: React.ComponentProps<'div'>) {
    return (
        <div className={cn('flex items-center space-x-3 flex-1 min-w-0', className)}>
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
    return (
        <div
            data-slot="label-tree-item-content"
            className={cn(
                'flex flex-1 min-w-0 items-center gap-2 p-2 group rounded-lg hover:bg-gray-50 group',
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

    if (!hasChildren) {
        return <div className="size-5 mr-2" />;
    }

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
            className={cn(
                'cursor-pointer flex-shrink-0 size-5 flex items-center justify-center font-medium transition-colors text-gray-500 group-hover:text-gray-700 mr-2',
                className
            )}
        >
            {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
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

const iconSizeMap = {
    sm: 'size-3',
    md: 'size-4',
    lg: 'size-5',
} as const;

export const LabelTreeItemIcon = memo(function LabelTreeItemIcon({
    className,
}: React.ComponentProps<'div'>) {
    const { currentLabel } = useLabelTreeData();

    if (!currentLabel) return null;

    const icon = currentLabel.icon || 'folder';
    const color = currentLabel.color || 'gray';

    return (
        <div
            style={{ backgroundColor: color }}
            className={cn(
                'size-10 rounded-lg bg-blue-100 text-white flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0',
                className
            )}
        >
            {renderLabelIcon(icon, iconSizeMap['lg'])}
        </div>
    );
});

export const LabelTreeItemTitle = memo(function LabelTreeItemTitle({
    className,
}: React.ComponentProps<'div'>) {
    const { currentLabel } = useLabelTreeData();

    if (!currentLabel) return null;

    return (
        <div
            data-slot="label-tree-item-title"
            className={cn(
                ' text-gray-900 font-semibold text-base group-hover:opacity-90 transition-all truncate',
                className
            )}
        >
            {currentLabel.name}
        </div>
    );
});
