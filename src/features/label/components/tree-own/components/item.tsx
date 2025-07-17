import { FlattenedItem } from '@/features/label/components/tree-own/types';

interface TreeItemProps {
    item: FlattenedItem;
    dragButton?: React.ReactNode;
}

/**
 * TreeItem is a component that renders a tree item.
 */
export const TreeItem = ({ item, dragButton }: TreeItemProps) => {
    const renderDragButton = () => {
        if (dragButton) {
            return dragButton;
        }
    };

    return (
        <div className="border w-full p-4 rounded-md flex gap-2 items-center bg-white">
            {renderDragButton()}
            {item.id}
        </div>
    );
};
