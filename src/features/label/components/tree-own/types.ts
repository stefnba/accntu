export interface TreeItem {
    id: string;
    children: TreeItem[];
}

export interface FlattenedItem extends TreeItem {
    parentId: string | null;
    index: number;
    depth: number;
    collapsed: boolean;
    childrenCount: number;
    hasChildren: boolean;
}

export interface TreeMoveOperation {
    activeId: string;
    overId: string;
    activeIndex: number;
    overIndex: number;
    activeItem: FlattenedItem;
    overItem: FlattenedItem;
}

// todo delete
export interface TreeState {
    items: TreeItem[];
    flattenedItems: FlattenedItem[];
    collapsedItems: Set<string>;
}
