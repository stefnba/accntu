// import classNames from 'classnames';
import React, { forwardRef, HTMLAttributes } from 'react';

import { Action } from '../../action';
import { Handle } from '../../handle';
import { Remove } from '../../remove';

export interface Props extends Omit<HTMLAttributes<HTMLLIElement>, 'id'> {
    childCount?: number;
    clone?: boolean;
    collapsed?: boolean;
    depth: number;
    disableInteraction?: boolean;
    disableSelection?: boolean;
    ghost?: boolean;
    handleProps?: any;
    indicator?: boolean;
    indentationWidth: number;
    value: string;
    onCollapse?(): void;
    onRemove?(): void;
    wrapperRef?(node: HTMLLIElement): void;
}

/**
 * Core tree item component with visual styling and interactions.
 *
 * Purpose: Renders individual tree items with:
 * - Hierarchical indentation based on depth
 * - Collapse/expand functionality
 * - Drag handle for reordering
 * - Remove button for deletion
 * - Visual states (ghost, clone, disabled)
 * - Accessibility support
 *
 * Optimization suggestions:
 * - Use React.memo for performance with large trees
 * - Implement virtual scrolling for 1000+ items
 * - Use CSS custom properties for dynamic styling
 * - Add intersection observer for lazy rendering
 * - Implement gesture recognition for mobile
 */
export const TreeItem = forwardRef<HTMLDivElement, Props>(
    (
        {
            childCount,
            clone,
            depth,
            disableSelection,
            disableInteraction,
            ghost,
            handleProps,
            indentationWidth,
            indicator,
            collapsed,
            onCollapse,
            onRemove,
            style,
            value,
            wrapperRef,
            ...props
        },
        ref
    ) => {
        /**
         * Renders the tree item with all interactive elements.
         *
         * Structure:
         * - li: Main container with indentation
         * - div: Content container with styling
         * - Handle: Drag handle for reordering
         * - Action: Collapse/expand button
         * - span: Item text content
         * - Remove: Delete button
         * - Child count badge (for clones)
         *
         * Optimization suggestions:
         * - Use CSS containment for better performance
         * - Implement efficient re-rendering strategies
         * - Add will-change CSS property for animations
         */
        return (
            {/* Main list item container with dynamic indentation */}
            <li
                ref={wrapperRef}
                style={
                    {
                        '--spacing': `${indentationWidth * depth}px`,
                        '--vertical-padding': depth === 0 ? '6px' : '4px',
                    } as React.CSSProperties
                }
                className={`
                    list-none box-border pl-[var(--spacing)] -mb-px
                    ${clone ? 'inline-block pointer-events-none p-0 pl-2.5 pt-1.5' : ''}
                    ${ghost && indicator ? 'opacity-100 relative z-10 -mb-px' : ''}
                    ${ghost && !indicator ? 'opacity-50' : ''}
                    ${disableSelection ? 'select-none' : ''}
                    ${disableInteraction ? 'pointer-events-none' : ''}
                `.trim()}
                {...props}
            >
                {/* Content container with visual styling */}
                <div
                    className={`
                        relative flex items-center py-[var(--vertical-padding)] px-2.5
                        bg-white border border-gray-300 text-gray-800 box-border
                        ${clone ? 'pr-6 rounded shadow-lg' : ''}
                        ${ghost && indicator ? 'relative p-0 h-2 border-blue-500 bg-blue-400 before:absolute before:-left-2 before:-top-1 before:block before:w-3 before:h-3 before:rounded-full before:border before:border-blue-500 before:bg-white before:content-[""]' : ''}
                        ${ghost && !indicator ? 'shadow-none bg-transparent' : ''}
                    `.trim()}
                    ref={ref}
                    style={style}
                >
                    {/* Drag handle for reordering */}
                    <Handle {...handleProps} />
                    {/* Collapse/expand button */}
                    {onCollapse && (
                        <Action
                            onClick={onCollapse}
                            className={`
                                mr-1 w-3 h-3 flex items-center justify-center
                                transition-transform duration-[250ms] ease-in-out
                                hover:bg-gray-200 rounded
                                ${collapsed ? '[&_svg]:-rotate-90' : ''}
                            `.trim()}
                        >
                            {collapseIcon}
                        </Action>
                    )}
                    {/* Item text content */}
                    <span
                        className={`
                        flex-grow pl-2 whitespace-nowrap text-ellipsis overflow-hidden
                        ${ghost && indicator ? 'opacity-0 h-0' : ''}
                        ${disableSelection ? 'select-none' : ''}
                    `.trim()}
                    >
                        {value}
                    </span>
                    {/* Remove button (hidden for clones) */}
                    {!clone && onRemove && <Remove onClick={onRemove} />}
                    {/* Child count badge for clones */}
                    {clone && childCount && childCount > 1 ? (
                        {/* Child count badge */}
                        <span
                            className={`
                            absolute -top-2.5 -right-2.5 flex items-center justify-center
                            w-6 h-6 rounded-full bg-blue-500 text-sm font-semibold text-white
                            ${disableSelection ? 'select-none' : ''}
                        `.trim()}
                        >
                            {childCount}
                        </span>
                    ) : null}
                </div>
            </li>
        );
    }
);

/**
 * SVG icon for collapse/expand functionality.
 *
 * Purpose: Provides visual indicator for collapsible items
 * - Rotates to show expand/collapse state
 * - Uses CSS transforms for smooth animation
 *
 * Optimization suggestions:
 * - Use CSS mask for better performance
 * - Consider using icon fonts or sprite sheets
 * - Implement lazy loading for complex icons
 */
const collapseIcon = (
    <svg
        width="6"
        height="6"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 70 41"
        className="fill-gray-600"
    >
        <path d="M30.76 39.2402C31.885 40.3638 33.41 40.995 35 40.995C36.59 40.995 38.115 40.3638 39.24 39.2402L68.24 10.2402C69.2998 9.10284 69.8768 7.59846 69.8494 6.04406C69.822 4.48965 69.1923 3.00657 68.093 1.90726C66.9937 0.807959 65.5106 0.178263 63.9562 0.150837C62.4018 0.123411 60.8974 0.700397 59.76 1.76024L35 26.5102L10.24 1.76024C9.10259 0.700397 7.59822 0.123411 6.04381 0.150837C4.4894 0.178263 3.00632 0.807959 1.90702 1.90726C0.807714 3.00657 0.178019 4.48965 0.150593 6.04406C0.123167 7.59846 0.700153 9.10284 1.75999 10.2402L30.76 39.2402Z" />
    </svg>
);
