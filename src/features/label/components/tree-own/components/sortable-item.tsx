import { DragHandleButton } from '@/components/drag-handle-button';
import { TreeItem } from '@/features/label/components/tree-own/components/item';
import { FlattenedItem } from '@/features/label/components/tree-own/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
    item: FlattenedItem;
}

/**
 * SortableItem is a component that renders a tree item and allows it to be dragged and dropped.
 */
export const SortableItem = ({ item }: SortableItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: item.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.1 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex gap-2 items-center p-2">
            {/* <DragHandleButton {...attributes} {...listeners} /> */}
            <TreeItem
                dragButton={<DragHandleButton {...attributes} {...listeners} />}
                item={item}
            />
        </div>
    );
};
