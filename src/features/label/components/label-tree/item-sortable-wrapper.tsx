import { cn } from '@/lib/utils';
import { DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { createContext, useContext } from 'react';
import type { DropProjection } from './tree-utilities';

// Context to provide drag handle props to children
const DragHandleContext = createContext<{
    attributes: DraggableAttributes | undefined;
    listeners: SyntheticListenerMap | undefined;
} | null>(null);

export const useDragHandle = () => {
    const context = useContext(DragHandleContext);
    if (!context) {
        throw new Error('useDragHandle must be used within a LabelTreeItemSortableWrapper');
    }
    return context;
};

export interface LabelTreeItemSortableWrapperProps {
    children: React.ReactNode;
    id: string;
    depth?: number;
    projection?: DropProjection | null;
    ghost?: boolean;
    childCount?: number;
    disableSelection?: boolean;
    disableInteraction?: boolean;
}

export const LabelTreeItemSortableWrapper: React.FC<LabelTreeItemSortableWrapperProps> = ({
    children,
    id,
    depth = 0,
    projection,
    ghost,
    _childCount = 0,
    disableSelection,
    disableInteraction,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isSorting,
        over,
        activeIndex,
        overIndex,
    } = useSortable({
        id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || (isSorting ? 'transform 200ms ease' : undefined),
        opacity: isDragging ? 0 : ghost ? 0.5 : 1, // Hide original when dragging (overlay will show)
        marginLeft: `${depth * 32}px`,
    } as React.CSSProperties;

    // Determine if this item is in a drop zone
    const isDropTarget = over?.id === id && !isDragging;
    const isActivelyMoving =
        activeIndex !== overIndex && (activeIndex === -1 || overIndex === -1 ? false : true);

    return (
        <DragHandleContext.Provider value={{ attributes, listeners }}>
            <div
                ref={setNodeRef}
                style={style}
                className={cn(
                    'transition-all duration-200 ease-out relative',
                    // Disable interactions if specified
                    disableInteraction && 'pointer-events-none',
                    disableSelection && 'select-none',
                    // Ghost styling for items being dragged over
                    ghost && 'opacity-50',
                    // Drag state styling - much softer
                    isDragging && [
                        'shadow-lg',
                        'scale-[1.01]',
                        'bg-white',
                        'ring-2 ring-blue-300/50',
                        'rounded-lg',
                        'z-50',
                    ],
                    // Drop target styling
                    isDropTarget && ['ring-2 ring-blue-400/30', 'bg-blue-50/30'],
                    // Smooth sorting animation
                    !isDragging && isActivelyMoving && 'transform-gpu'
                )}
            >
                {children}
            </div>
        </DragHandleContext.Provider>
    );
};
