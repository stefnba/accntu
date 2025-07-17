import { FlattenedItem, TreeItem } from '@/features/label/components/tree-own/types';

/**
 * Flattens a tree structure into a flat array of items.
 * @param tree - The tree structure to flatten.
 * @returns The flattened array of items.
 */
// export const flattenTree = (tree: TreeItem[]): FlattenedItem[] => {
//     return tree.reduce<FlattenedItem[]>((acc, item) => {
//         // const children = flattenTree(item.children);

//         const flattenedItem: FlattenedItem = {
//             ...item,
//             // children,
//             parentId: null,
//             index: 0,
//             depth: 0,
//             collapsed: false,
//             parentIds: [],
//         };

//         acc.push(flattenedItem);

//         if (item.children.length > 0) {
//             const children = flattenTree(item.children);
//             acc.push(...children);
//         }

//         return [...acc, flattenedItem];
//     }, []);
// };

/**
 * Recursively flattens a hierarchical tree structure into a linear array
 * @param items - The tree items to flatten
 * @param parentId - The parent ID for the current level (null for root)
 * @param depth - The current depth level (0 for root)
 * @returns A flat array of items with depth and parent information
 *
 * This converts a nested tree structure into a flat array that's easier to work with
 * for rendering and drag operations while preserving hierarchy information.
 */
const flatten = (items: TreeItem[], parentId: string | null = null, depth = 0): FlattenedItem[] => {
    return items.reduce<FlattenedItem[]>((acc, item, index) => {
        return [
            ...acc,
            {
                ...item,
                parentId,
                depth,
                index,
                collapsed: false,
            },
            ...flatten(item.children, item.id, depth + 1),
        ];
    }, []);
};

/**
 * Public API for flattening a tree structure
 * @param items - The tree items to flatten
 * @returns A flat array of items with hierarchy information
 *
 * This is the main function used throughout the application to convert
 * hierarchical tree data into a flat structure for rendering.
 */
export const flattenTree = (items: TreeItem[]): FlattenedItem[] => flatten(items);

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
