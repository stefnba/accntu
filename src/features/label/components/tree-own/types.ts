import { UniqueIdentifier } from '@dnd-kit/core';

/**
 * A tree item
 */
export interface TreeItem {
    /**
     * The ID of the item
     */
    id: UniqueIdentifier;
    /**
     * The children of the item
     */
    children: TreeItem[];
}

/**
 * A flattened tree item, no nested children
 */
export interface FlattenedItem extends TreeItem {
    /**
     * The parent ID of the item.
     * Null if the item is a root item.
     */
    parentId: UniqueIdentifier | null;
    /**
     * The index of the item in the flattened array
     */
    index: number;
    /**
     * The depth of the item in the tree
     */
    depth: number;
    /**
     * Whether the item is collapsed
     */
    collapsed: boolean;
    /**
     * The number of children the item has
     */
    childrenCount: number;
    /**
     * Whether the item has children
     */
    hasChildren: boolean;
    /**
     * The index of the item in the current depth
     */
    currentDepthIndex: number;
    /**
     * The index of the item in the parent's children
     */
    parentIndex: number;
}

export interface TreeMoveOperation {
    activeId: UniqueIdentifier;
    overId: UniqueIdentifier;
    activeIndex: number;
    overIndex: number;
    activeItem: FlattenedItem;
    overItem: FlattenedItem;
}
