import {
    closestCorners,
    DroppableContainer,
    getFirstCollision,
    KeyboardCode,
    KeyboardCoordinateGetter,
} from '@dnd-kit/core';

import type { SensorContext } from './types';
import { getProjection } from './utils';

/**
 * Valid keyboard direction codes for tree navigation.
 * 
 * Purpose: Defines which keys trigger drag operations
 * - Maps to arrow keys for directional movement
 * - Used for keyboard accessibility
 * 
 * Optimization suggestions:
 * - Use Set for O(1) lookup performance
 * - Consider adding more navigation keys (Page Up/Down)
 * - Add support for custom key bindings
 */
const directions: string[] = [
    KeyboardCode.Down,
    KeyboardCode.Right,
    KeyboardCode.Up,
    KeyboardCode.Left,
];

/**
 * Horizontal navigation keys for depth control.
 * 
 * Purpose: Identifies keys that change nesting depth
 * - Left arrow: decrease depth (un-nest)
 * - Right arrow: increase depth (nest)
 * 
 * Optimization suggestions:
 * - Use Set for faster lookup
 * - Consider adding Shift+Tab and Tab for depth changes
 * - Add support for configurable key bindings
 */
const horizontal: string[] = [KeyboardCode.Left, KeyboardCode.Right];

/**
 * Creates a keyboard coordinate getter for tree navigation.
 * 
 * Purpose: Enables keyboard-based drag and drop operations
 * - Handles arrow key navigation
 * - Manages depth changes with horizontal keys
 * - Provides accessibility support
 * - Integrates with DndKit keyboard sensor
 * 
 * This is a higher-order function that returns a coordinate getter configured
 * for tree-specific navigation patterns.
 * 
 * Optimization suggestions:
 * - Memoize coordinate calculations
 * - Add keyboard shortcuts for common operations
 * - Implement key repeat handling
 * - Consider using requestAnimationFrame for smooth movement
 */
export const sortableTreeKeyboardCoordinates: (
    context: SensorContext,
    indicator: boolean,
    indentationWidth: number
) => KeyboardCoordinateGetter =
    (context, indicator, indentationWidth) =>
    (
        event,
        {
            currentCoordinates,
            context: { active, over, collisionRect, droppableRects, droppableContainers },
        }
    ) => {
        /**
         * Process keyboard events for tree navigation.
         * 
         * Purpose: Handles directional key presses
         * - Filters valid navigation keys
         * - Prevents default browser behavior
         * - Calculates new coordinates based on key
         * 
         * Optimization suggestions:
         * - Use key code constants for better readability
         * - Add debouncing for rapid key presses
         * - Consider key combination support
         */
        if (directions.includes(event.code)) {
            if (!active || !collisionRect) {
                return;
            }

            event.preventDefault();

            const {
                current: { items, offset },
            } = context;

            // Handle horizontal movement for depth changes
            if (horizontal.includes(event.code) && over?.id) {
                // Calculate current projection to get depth constraints
                const { depth, maxDepth, minDepth } = getProjection(
                    items,
                    active.id,
                    over.id,
                    offset,
                    indentationWidth
                );

                // Process left/right arrow keys for depth adjustment
                switch (event.code) {
                    case KeyboardCode.Left:
                        // Decrease depth (un-nest) if possible
                        if (depth > minDepth) {
                            return {
                                ...currentCoordinates,
                                x: currentCoordinates.x - indentationWidth,
                            };
                        }
                        break;
                    case KeyboardCode.Right:
                        // Increase depth (nest) if possible
                        if (depth < maxDepth) {
                            return {
                                ...currentCoordinates,
                                x: currentCoordinates.x + indentationWidth,
                            };
                        }
                        break;
                }

                return undefined;
            }

            // Handle vertical movement (up/down arrows)
            // Find valid drop containers based on direction
            const containers: DroppableContainer[] = [];

            // Filter containers based on vertical direction
            droppableContainers.forEach((container) => {
                if (container?.disabled || container.id === over?.id) {
                    return;
                }

                const rect = droppableRects.get(container.id);

                if (!rect) {
                    return;
                }

                // Filter containers based on up/down movement
                switch (event.code) {
                    case KeyboardCode.Down:
                        // Find containers below current position
                        if (collisionRect.top < rect.top) {
                            containers.push(container);
                        }
                        break;
                    case KeyboardCode.Up:
                        // Find containers above current position
                        if (collisionRect.top > rect.top) {
                            containers.push(container);
                        }
                        break;
                }
            });

            // Detect collisions with filtered containers
            const collisions = closestCorners({
                active,
                collisionRect,
                pointerCoordinates: null,
                droppableRects,
                droppableContainers: containers,
            });
            // Get the closest valid drop target
            let closestId = getFirstCollision(collisions, 'id');

            // If closest is current target, use next closest
            if (closestId === over?.id && collisions.length > 1) {
                closestId = collisions[1].id;
            }

            // Calculate final coordinates for the new position
            if (closestId && over?.id) {
                const activeRect = droppableRects.get(active.id);
                const newRect = droppableRects.get(closestId);
                const newDroppable = droppableContainers.get(closestId);

                // Calculate new coordinates with proper depth and positioning
                if (activeRect && newRect && newDroppable) {
                    const newIndex = items.findIndex(({ id }) => id === closestId);
                    const newItem = items[newIndex];
                    const activeIndex = items.findIndex(({ id }) => id === active.id);
                    const activeItem = items[activeIndex];

                    // Calculate final position with depth adjustment
                    if (newItem && activeItem) {
                        // Project new depth based on target item
                        const { depth } = getProjection(
                            items,
                            active.id,
                            closestId,
                            (newItem.depth - activeItem.depth) * indentationWidth,
                            indentationWidth
                        );
                        // Determine if moving up or down for offset calculation
                        const isBelow = newIndex > activeIndex;
                        const modifier = isBelow ? 1 : -1;
                        const offset = indicator
                            ? (collisionRect.height - activeRect.height) / 2
                            : 0;

                        // Calculate final coordinates with depth and vertical offset
                        const newCoordinates = {
                            x: newRect.left + depth * indentationWidth,
                            y: newRect.top + modifier * offset,
                        };

                        return newCoordinates;
                    }
                }
            }
        }

        return undefined;
    };
