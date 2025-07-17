import { FlattenedItem, TreeItem } from '@/features/label/components/tree-own/types';

/**
 * Flattens a tree structure into a flat array of items.
 * @param tree - The tree structure to flatten.
 * @returns The flattened array of items.
 */
export const flattenTree = (tree: TreeItem[]): FlattenedItem[] => {
    return tree.reduce<FlattenedItem[]>((acc, item) => {
        const children = flattenTree(item.children);
        return [
            ...acc,
            { ...item, children, parentId: null, index: 0, depth: 0, collapsed: false },
        ];
    }, []);
};

/**
 * Builds a tree structure from a flattened array of items.
 * @param flattenedItems - The flattened array of items.
 * @returns The tree structure.
 */
export const buildTree = (flattenedItems: FlattenedItem[]): TreeItem[] => {
    const tree: TreeItem[] = [];

    flattenedItems.forEach((item) => {
        const parent = tree.find((t) => t.id === item.parentId);
        if (parent) {
            parent.children.push(item);
        } else {
            tree.push(item);
        }
    });

    return tree;
};
