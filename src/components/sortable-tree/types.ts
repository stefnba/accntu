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

export interface ParentItem {
    id: UniqueIdentifier;
    index: number;
    depth: number;
    childrenCount: number;
}

/**
 * A flattened tree item, no nested children
 */
export type FlattenedItem<T extends TreeItem = TreeItem> = T & {
    /**
     * The parent of the item.
     * Null if the item is a root item.
     */
    parent: ParentItem | null;
    /**
     * The index of the item in the flattened array (global index)
     */
    index: number;
    /**
     * The index of the item in the current depth (ordinal index under the same parent)
     */
    currentDepthIndex: number;
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
}

export interface TreeMoveOperation {
    activeId: UniqueIdentifier;
    overId: UniqueIdentifier;
    activeIndex: number;
    overIndex: number;
    activeItem: FlattenedItem;
    overItem: FlattenedItem;
}