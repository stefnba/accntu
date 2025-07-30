import { forwardRef } from 'react';

import { Action, Props as ActionProps } from './action';

/**
 * Drag handle component for tree items.
 * 
 * Purpose: Provides visual indicator and interaction area for dragging
 * - Uses grab cursor to indicate draggable area
 * - Contains drag handle icon (six dots pattern)
 * - Integrates with DndKit's drag system
 * - Provides accessible drag interaction
 * 
 * Optimization suggestions:
 * - Use CSS sprites for better icon performance
 * - Add touch-specific sizing for mobile
 * - Implement custom drag cursors
 * - Consider using CSS custom properties for theming
 */
export const Handle = forwardRef<HTMLButtonElement, ActionProps>((props, ref) => {
    return (
        {/* Action button with grab cursor and drag handle icon */}
        <Action ref={ref} cursor="grab" data-cypress="draggable-handle" {...props}>
            {/* Six-dot drag handle icon */}
            <svg viewBox="0 0 20 20" width="10">
                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
            </svg>
        </Action>
    );
});
