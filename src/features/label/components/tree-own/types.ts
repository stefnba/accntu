export type TreeItem = {
    id: string;
    children: TreeItem[];
};

export type FlattenedItem = TreeItem & {
    parentId: string | null;
    index: number;
    depth: number;
    collapsed: boolean;
};
