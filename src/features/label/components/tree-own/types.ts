import { UniqueIdentifier } from '@dnd-kit/core';

export interface TreeItem {
    id: UniqueIdentifier;
    children: TreeItem[];
}

export interface FlattenedItem extends TreeItem {
    parentId: UniqueIdentifier | null;
    index: number;
    depth: number;
    collapsed: boolean;
    childrenCount: number;
    hasChildren: boolean;
}

export interface TreeMoveOperation {
    activeId: UniqueIdentifier;
    overId: UniqueIdentifier;
    activeIndex: number;
    overIndex: number;
    activeItem: FlattenedItem;
    overItem: FlattenedItem;
}
