import { DragHandleButton } from '@/components/drag-handle-button';
import { TreeItem } from '@/features/label/components/tree-own/components/item';
import { INDENTATION_WIDTH } from '@/features/label/components/tree-own/config';
import { FlattenedItem } from '@/features/label/components/tree-own/types';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo } from 'react';

interface SortableItemProps {
    item: FlattenedItem;
    depth: number;
}

/**
 * SortableItem is a memoized component that renders a tree item and allows it to be dragged and dropped.
 */
export const SortableItem = memo(({ item, depth }: SortableItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
        useSortable({
            id: item.id,
            data: {
                type: 'tree-item',
                item,
            },
        });

    const depthIndent = depth * INDENTATION_WIDTH;

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.5 : 1,
                marginLeft: `${depthIndent}px`,
                width: `calc(100% - ${depthIndent}px)`,
            }}
            className={cn(
                'relative transition-colors duration-200',
                // Subtle drop zone highlighting
                isOver && 'bg-blue-50 border-l-2 border-blue-300'
                // Hover state when not dragging
                // !isDragging && 'hover:bg-gray-50',
                // isDragging && 'h-0'
            )}
        >
            {/* Simple drop indicator line */}
            {/* {isOver && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 opacity-75" />
            )} */}

            <TreeItem
                item={item}
                dragButton={<DragHandleButton {...attributes} {...listeners} />}
            />
        </div>
    );
});

SortableItem.displayName = 'SortableItem';
