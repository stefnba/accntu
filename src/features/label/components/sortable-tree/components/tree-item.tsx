import React, { forwardRef, useMemo, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { TreeHandle } from './tree-handle';
import { TreeCollapse } from './tree-collapse';
import { TreeRemove } from './tree-remove';
import type { TreeItemProps } from '../types';
import { TREE_ITEM_STYLES, ACCESSIBILITY_LABELS } from '../utils/constants';

export const TreeItem = React.memo(
    forwardRef<HTMLDivElement, TreeItemProps>(
        (
            {
                id,
                value,
                depth,
                childCount,
                clone,
                collapsed,
                disableInteraction,
                disableSelection,
                ghost,
                handleProps,
                indicator,
                indentationWidth,
                onCollapse,
                onRemove,
                style,
                wrapperRef,
                className,
                ...props
            },
            ref
        ) => {
            const cssVariables = useMemo(
                () => ({
                    '--spacing': `${indentationWidth * depth}px`,
                    '--vertical-padding': depth === 0 ? TREE_ITEM_STYLES.verticalPadding.root : TREE_ITEM_STYLES.verticalPadding.nested,
                }) as CSSProperties,
                [indentationWidth, depth]
            );

            const containerClasses = useMemo(
                () => cn(
                    'list-none box-border pl-[var(--spacing)] -mb-px',
                    clone && 'inline-block pointer-events-none p-0 pl-2.5 pt-1.5',
                    ghost && indicator && 'opacity-100 relative z-10 -mb-px',
                    ghost && !indicator && TREE_ITEM_STYLES.colors.ghost,
                    disableSelection && 'select-none',
                    disableInteraction && 'pointer-events-none',
                    className
                ),
                [clone, ghost, indicator, disableSelection, disableInteraction, className]
            );

            const itemClasses = useMemo(
                () => cn(
                    'relative flex items-center py-[var(--vertical-padding)] px-2.5',
                    'box-border',
                    TREE_ITEM_STYLES.colors.background,
                    TREE_ITEM_STYLES.colors.border,
                    TREE_ITEM_STYLES.colors.text,
                    TREE_ITEM_STYLES.transition,
                    clone && 'pr-6 rounded shadow-lg',
                    ghost && indicator && 'relative p-0 h-2 border-blue-500 bg-blue-400 before:absolute before:-left-2 before:-top-1 before:block before:w-3 before:h-3 before:rounded-full before:border before:border-blue-500 before:bg-white before:content-[""]',
                    ghost && !indicator && 'shadow-none bg-transparent',
                    !ghost && !disableInteraction && TREE_ITEM_STYLES.colors.hover
                ),
                [clone, ghost, indicator, disableInteraction]
            );

            const labelClasses = useMemo(
                () => cn(
                    'flex-grow pl-2 whitespace-nowrap text-ellipsis overflow-hidden',
                    ghost && indicator && 'opacity-0 h-0',
                    disableSelection && 'select-none'
                ),
                [ghost, indicator, disableSelection]
            );

            const childCountClasses = useMemo(
                () => cn(
                    'absolute -top-2.5 -right-2.5 flex items-center justify-center',
                    'w-6 h-6 rounded-full bg-blue-500 text-sm font-semibold text-white',
                    disableSelection && 'select-none'
                ),
                [disableSelection]
            );

            return (
                <li
                    ref={wrapperRef}
                    style={cssVariables}
                    className={containerClasses}
                    role="treeitem"
                    aria-label={`${ACCESSIBILITY_LABELS.treeItem} ${value}`}
                    aria-level={depth + 1}
                    aria-expanded={collapsed !== undefined ? !collapsed : undefined}
                    {...props}
                >
                    <div
                        ref={ref}
                        style={style}
                        className={itemClasses}
                    >
                        <TreeHandle {...handleProps} />
                        
                        {onCollapse && (
                            <TreeCollapse
                                onClick={onCollapse}
                                collapsed={collapsed}
                                itemLabel={value}
                            />
                        )}

                        <span className={labelClasses}>
                            {value}
                        </span>

                        {!clone && onRemove && (
                            <TreeRemove 
                                onClick={onRemove}
                                itemLabel={value}
                            />
                        )}

                        {clone && childCount && childCount > 1 && (
                            <span className={childCountClasses}>
                                {childCount}
                            </span>
                        )}
                    </div>
                </li>
            );
        }
    ),
    (prevProps, nextProps) => {
        // Custom comparison function for React.memo optimization
        const keysToCompare: (keyof TreeItemProps)[] = [
            'id',
            'value',
            'depth',
            'collapsed',
            'ghost',
            'clone',
            'disableInteraction',
            'disableSelection',
            'indicator',
            'indentationWidth',
            'childCount',
        ];

        return keysToCompare.every(key => prevProps[key] === nextProps[key]);
    }
);

TreeItem.displayName = 'TreeItem';