import { UniqueIdentifier } from '@dnd-kit/core';

/**
 * Base interface that all flattened tree item data must extend
 * Contains the minimum required fields for tree functionality
 */
export interface FlattenedTreeItemBase {
    /**
     * The unique ID of the item
     */
    id: UniqueIdentifier;
    /**
     * The global index of the item in the flattened array (used for ordering)
     */
    globalIndex: number;
    /**
     * The depth of the item in the tree (0 = root level)
     */
    depth: number;
    /**
     * Whether the item has children
     */
    hasChildren: boolean;
    /**
     * The number of children the item has
     */
    countChildren: number;
    /**
     * The ID of the parent item (null for root items)
     */
    parentId: string | null;
    /**
     * The index of the item within its current depth level
     */
    currentDepthIndex: number;
}

/**
 * Client-side enhancement fields for flattened tree items after processing server data
 */
interface ClientSideFields {
    /**
     * Whether the item is collapsed (client-side state)
     */
    collapsed: boolean;
}

/**
 * A flattened tree item with client-side enhancement fields
 * D must extend FlattenedTreeItemBase to ensure tree functionality
 */
export type FlattenedItem<D extends FlattenedTreeItemBase> = D;

/**
 * A tree move operation
 * @param D - The type of the flattened tree item data
 */
export interface TreeMoveOperation<D extends FlattenedTreeItemBase> {
    activeId: UniqueIdentifier;
    overId: UniqueIdentifier;
    activeIndex: number;
    overIndex: number;
    activeItem: FlattenedItem<D>;
    overItem: FlattenedItem<D>;
}

/**
 * Drop intent types for enhanced tree operations
 */
export type DropIntent =
    | { type: 'insert-before'; targetId: UniqueIdentifier }
    | { type: 'insert-after'; targetId: UniqueIdentifier }
    | { type: 'nest-under'; parentId: UniqueIdentifier };

/**
 * Options for the sortable tree
 * @param D - The type of the flattened tree item data (must extend FlattenedTreeItemBase)
 */
export interface SortableTreeOptions<D extends FlattenedTreeItemBase> {
    queryKey: readonly string[];
    queryFn: () => Promise<D[]>;
    mutateFn: (data: FlattenedItem<D>[]) => Promise<FlattenedItem<D>[]>;
    indentationWidth?: number;
}
