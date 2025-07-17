export type TreeItem = {
    id: string;
    children: TreeItem[];
};

export type FlattenedItem = TreeItem & {
    /**
     * The parent ID of the item.
     */
    parentId: string | null;
    /**
     * The index of the item in the parent's children array.
     */
    index: number;
    /**
     * The depth of the item in the tree.
     */
    depth: number;
    /**
     * Whether the item is collapsed.
     */
    collapsed: boolean;
};
