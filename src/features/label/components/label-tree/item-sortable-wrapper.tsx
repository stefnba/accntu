import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface LabelTreeItemSortableWrapperProps {
    children: React.ReactNode;
    id: string;
}

export const LabelTreeItemSortableWrapper: React.FC<LabelTreeItemSortableWrapperProps> = ({
    children,
    id,
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
    };
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
};
