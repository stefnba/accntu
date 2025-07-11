'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { memo, useCallback } from 'react';
import { useLabelTreeData } from './provider';

// Types
export interface LabelTreeItemActionsProps {
    children?: React.ReactNode;
    className?: string;
}

export interface LabelTreeItemActionProps {
    children?: React.ReactNode;
    onClick?: (labelId: string) => void;
    tooltip?: string;
    style?: React.CSSProperties;
    className?: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

/**
 * Label tree item actions component.
 * Responsible for rendering the action container of a label tree item.
 */
export const LabelTreeItemActions = memo(function LabelTreeItemActions({
    children,
    className,
}: LabelTreeItemActionsProps) {
    return (
        <div
            data-slot="label-tree-item-actions"
            className={cn(
                'flex space-x-1 flex-shrink-0 ml-4 duration-300 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
                className
            )}
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
    style,
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
                style={style}
                variant={variant}
                size="sm"
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                aria-label={tooltip || 'Action'}
                className={` w-8 h-8 p-2 rounded-full transition-all border hover:scale-105  bg-white ${variant === 'ghost' && className?.includes('text-red') ? 'text-red-600 hover:text-red-700' : ''} ${className || ''}`}
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
