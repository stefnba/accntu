import { DragHandleButton } from '@/components/drag-handle-button';
import { FlattenedItem, TreeItem, TRenderItemProps } from '@/components/sortable-tree/types';
import { cn } from '@/lib/utils';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo } from 'react';

interface SortableItemProps<T extends TreeItem> {
    item: FlattenedItem<T>;
    depth: number;
    indentationWidth: number;
    expandedIds: Set<UniqueIdentifier>;
    toggleExpandedId: (id: UniqueIdentifier) => void;
    renderItem: (props: TRenderItemProps<T>) => React.ReactNode;
}

/**
 * SortableItem is a memoized component that renders a tree item and allows it to be dragged and dropped.
 */
export const SortableItem = memo(
    <T extends TreeItem>({
        item,
        depth,
        indentationWidth,
        expandedIds,
        toggleExpandedId,
        renderItem,
    }: SortableItemProps<T>) => {
        const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
            id: item.id,
            data: {
                type: 'tree-item',
                item,
            },
        });

        const depthIndent = depth * indentationWidth;
        const dragButton = <DragHandleButton {...attributes} {...listeners} />;

        return (
            <div
                ref={setNodeRef}
                style={{
                    transform: CSS.Transform.toString(transform),
                    transition,
                    marginLeft: `${depthIndent}px`,
                    width: `calc(100% - ${depthIndent}px)`,
                }}
                className={cn('relative transition-all duration-200')}
            >
                {renderItem({ item, dragButton, expandedIds, toggleExpandedId })}
            </div>
        );
    }
);

SortableItem.displayName = 'SortableItem';
