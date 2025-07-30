import React, { CSSProperties, forwardRef } from 'react';

export interface Props extends React.HTMLAttributes<HTMLButtonElement> {
    active?: {
        fill: string;
        background: string;
    };
    cursor?: CSSProperties['cursor'];
}

/**
 * Generic action button component for tree interactions.
 * 
 * Purpose: Provides consistent button styling and behavior
 * - Supports custom cursors for different actions
 * - Handles active states with custom colors
 * - Provides keyboard accessibility
 * - Maintains consistent focus states
 * 
 * Used by:
 * - Handle component for drag operations
 * - Collapse/expand buttons
 * - Remove buttons
 * 
 * Optimization suggestions:
 * - Use CSS custom properties for theming
 * - Implement ripple effects for better feedback
 * - Add loading states for async operations
 * - Consider using CSS-in-JS for dynamic styling
 */
export const Action = forwardRef<HTMLButtonElement, Props>(
    ({ active, className, cursor, style, ...props }, ref) => {
        return (
            <button
                ref={ref}
                {...props}
                className={`
                    inline-flex items-center justify-center p-0.5 rounded
                    hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500
                    ${className || ''}
                `.trim()}
                tabIndex={0}
                style={
                    {
                        ...style,
                        cursor,
                        '--fill': active?.fill,
                        '--background': active?.background,
                    } as CSSProperties
                }
            />
        );
    }
);
