import { DragHandleButton } from '@/components/drag-handle-button';
import { useDragHandle } from '@/features/label/components/label-tree/item-sortable-wrapper';

export interface DragHandleProps {
    className?: string;
}

export const DragHandle = ({ className }: DragHandleProps) => {
    const dragHandleProps = useDragHandle();
    return (
        <div {...dragHandleProps.attributes} {...dragHandleProps.listeners}>
            <DragHandleButton className={className} size="sm" />
        </div>
    );
};
