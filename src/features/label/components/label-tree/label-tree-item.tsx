'use client';

import { Button } from '@/components/ui/button';
import { LabelBadge } from '@/features/label/components/label-badge';
import type { TLabelQuery } from '@/features/label/schemas';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
// import { LabelTreeItemActionsWrapper } from './label-tree-actions';
import { LabelTreeProvider, useLabelTreeContext } from './provider';

export interface LabelTreeItemProps extends React.ComponentProps<'div'> {
    label: TLabelQuery['select'] & { children?: TLabelQuery['select'][] };
    level?: number;
}

export function LabelTreeItem({ label, level = 0, className, children }: LabelTreeItemProps) {
    return (
        <LabelTreeProvider label={label} level={level} showChildren showActions>
            <div data-slot="label-tree-item" className={cn('space-y-1', className)}>
                <LabelTreeItemContent />
                {children}
                <LabelTreeItemChildren />
            </div>
        </LabelTreeProvider>
    );
}

export function LabelTreeItemContent({ className }: React.ComponentProps<'div'>) {
    const { currentLabel, currentLevel } = useLabelTreeContext();

    if (!currentLabel) return null;

    return (
        <div
            data-slot="label-tree-item-content"
            className={cn(
                'flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 group',
                currentLevel > 0 && 'ml-6',
                className
            )}
        >
            <LabelTreeItemButton />
            <LabelTreeItemBadge />
            <LabelTreeItemActionsWrapper />
        </div>
    );
}

export function LabelTreeItemButton({ className }: React.ComponentProps<'button'>) {
    const { currentLabel, toggleExpanded, isExpanded, showChildren } = useLabelTreeContext();

    if (!currentLabel) return null;

    const hasChildren = currentLabel.children && currentLabel.children.length > 0;
    const expanded = isExpanded(currentLabel.id);

    return (
        <Button
            data-slot="label-tree-item-button"
            variant="ghost"
            size="icon"
            onClick={() => toggleExpanded(currentLabel.id)}
            className={cn('flex-shrink-0 w-4 h-4 flex items-center justify-center', className)}
        >
            {hasChildren && showChildren ? (
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
}

export function LabelTreeItemBadge({ className }: React.ComponentProps<'div'>) {
    const { currentLabel, onSelect } = useLabelTreeContext();

    if (!currentLabel) return null;

    if (onSelect) {
        return (
            <Button
                data-slot="label-tree-item-badge"
                variant="ghost"
                size="sm"
                onClick={() => onSelect(currentLabel.id)}
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
}

export function LabelTreeItemChildren({ className }: React.ComponentProps<'div'>) {
    const { currentLabel, isExpanded, showChildren, currentLevel } = useLabelTreeContext();

    if (!currentLabel) return null;

    const hasChildren = currentLabel.children && currentLabel.children.length > 0;
    const expanded = isExpanded(currentLabel.id);

    if (!hasChildren || !expanded || !showChildren) {
        return null;
    }

    return (
        <div data-slot="label-tree-item-children" className={cn('space-y-1', className)}>
            {currentLabel.children?.map((child) => (
                <LabelTreeItem key={child.id} label={child} level={currentLevel + 1} />
            ))}
        </div>
    );
}
