import React, { forwardRef, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import type { TreeActionProps } from '../types';
import { TREE_ITEM_STYLES } from '../utils/constants';

export const TreeAction = forwardRef<HTMLButtonElement, TreeActionProps>(
    ({ active, className, cursor, style, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center p-0.5 rounded',
                    'hover:bg-gray-100 focus:outline-none',
                    TREE_ITEM_STYLES.focus,
                    TREE_ITEM_STYLES.transition,
                    className
                )}
                tabIndex={0}
                style={{
                    ...style,
                    cursor,
                    '--fill': active?.fill,
                    '--background': active?.background,
                } as CSSProperties}
                {...props}
            >
                {children}
            </button>
        );
    }
);

TreeAction.displayName = 'TreeAction';