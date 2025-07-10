'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { memo, useCallback } from 'react';
import { useLabelTreeData } from './provider';

// Types
export interface LabelTreeItemActionsProps {
    children?: React.ReactNode;
}

export interface LabelTreeItemActionProps {
    children?: React.ReactNode;
    onClick?: (labelId: string) => void;
    tooltip?: string;
    className?: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

/**
 * Label tree item actions component.
 * Responsible for rendering the action container of a label tree item.
 */
export const LabelTreeItemActions = memo(function LabelTreeItemActions({
    children,
}: LabelTreeItemActionsProps) {
    return (
        <div
            data-slot="label-tree-item-actions"
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
            {children}
        </div>
    );
});

/**
 * Individual action button component for label tree items.
 * Provides a generic action button with optional tooltip.
 */
export const LabelTreeItemAction = memo(function LabelTreeItemAction({
    children,
    onClick,
    tooltip,
    className,
    variant = 'ghost',
}: LabelTreeItemActionProps) {
    const { currentLabel } = useLabelTreeData();

    if (!currentLabel) return null;

    const handleClick = useCallback(() => {
        onClick?.(currentLabel.id);
    }, [currentLabel.id, onClick]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if ((e.key === 'Enter' || e.key === ' ') && onClick) {
                e.preventDefault();
                onClick(currentLabel.id);
            }
        },
        [currentLabel.id, onClick]
    );

    const renderButton = () => {
        return (
            <Button
                variant={variant}
                size="sm"
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                aria-label={tooltip || 'Action'}
                className={`h-6 w-6 p-0 ${variant === 'ghost' && className?.includes('text-red') ? 'text-red-600 hover:text-red-700' : ''} ${className || ''}`}
            >
                {children}
            </Button>
        );
    };

    if (tooltip) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>{renderButton()}</TooltipTrigger>
                    <TooltipContent>{tooltip}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return renderButton();
});
