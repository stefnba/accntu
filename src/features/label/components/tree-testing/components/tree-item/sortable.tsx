import type { UniqueIdentifier } from '@dnd-kit/core';
import { AnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CSSProperties } from 'react';

import { iOS } from '../../utils';
import { TreeItem, Props as TreeItemProps } from './item';

interface Props extends TreeItemProps {
    id: UniqueIdentifier;
}

/**
 * Configuration for layout animation during sorting operations.
 *
 * Purpose: Controls when layout animations should occur
 * - Disables animations during active sorting for performance
 * - Disables animations during drag operations
 * - Enables animations for other layout changes
 *
 * Optimization suggestions:
 * - Use CSS transitions instead of JavaScript animations
 * - Consider using transform-based animations
 * - Add easing functions for smoother transitions
 */
const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting, wasDragging }) =>
    isSorting || wasDragging ? false : true;

/**
 * Sortable wrapper component for tree items.
 *
 * Purpose: Integrates tree items with DndKit's sortable functionality
 * - Provides drag and drop capabilities
 * - Handles touch and mouse interactions
 * - Manages visual feedback during drag operations
 * - Bridges DndKit hooks with tree item display
 *
 * Optimization suggestions:
 * - Use React.memo to prevent unnecessary re-renders
 * - Implement gesture recognizers for mobile
 * - Add haptic feedback for touch devices
 * - Consider using CSS transforms for better performance
 */
export function SortableTreeItem({ id, depth, ...props }: Props) {
    /**
     * DndKit sortable hook providing drag and drop functionality.
     *
     * Purpose: Connects component to DndKit's sortable system
     * - Provides drag attributes and event listeners
     * - Manages drag state (isDragging, isSorting)
     * - Handles DOM node refs for drag/drop areas
     * - Provides transform and transition values
     *
     * Optimization suggestions:
     * - Use activation constraints to prevent accidental drags
     * - Implement custom drag overlays for better UX
     * - Add touch-specific configurations
     */
    const {
        attributes,
        isDragging,
        isSorting,
        listeners,
        setDraggableNodeRef,
        setDroppableNodeRef,
        transform,
        transition,
    } = useSortable({
        id,
        animateLayoutChanges,
    });
    /**
     * CSS styles for drag transform and transition effects.
     *
     * Purpose: Applies visual feedback during drag operations
     * - Translates item position during drag
     * - Provides smooth transitions
     * - Maintains visual consistency
     *
     * Optimization suggestions:
     * - Use transform3d for hardware acceleration
     * - Implement custom easing functions
     * - Consider using CSS custom properties
     */
    const style: CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <TreeItem
            ref={setDraggableNodeRef}
            wrapperRef={setDroppableNodeRef}
            style={style}
            depth={depth}
            ghost={isDragging}
            disableSelection={iOS}
            disableInteraction={isSorting}
            handleProps={{
                ...attributes,
                ...listeners,
            }}
            {...props}
        />
    );
}
