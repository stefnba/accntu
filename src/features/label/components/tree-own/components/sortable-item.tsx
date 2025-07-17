import { DragHandleButton } from '@/components/drag-handle-button';
import { TreeItem } from '@/features/label/components/tree-own/components/item';
import { FlattenedItem } from '@/features/label/components/tree-own/types';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo } from 'react';

interface SortableItemProps {
    item: FlattenedItem;
}

/**
 * SortableItem is a memoized component that renders a tree item and allows it to be dragged and dropped.
 */
export const SortableItem = memo(({ item }: SortableItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
        useSortable({
            id: item.id,
        });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'transition-colors duration-200'
                // isOver ? 'bg-blue-50 border-blue-200' : '',
                // isDragging ? 'shadow-lg' : ''
            )}
        >
            <TreeItem
                item={item}
                dragButton={<DragHandleButton {...attributes} {...listeners} />}

                // className={isOver ? 'border-blue-300' : undefined}
            />
        </div>
    );
});

SortableItem.displayName = 'SortableItem';
