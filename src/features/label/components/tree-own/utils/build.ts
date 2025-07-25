import { FlattenedItem, TreeItem } from '@/features/label/components/tree-own/types';

/**
 * Builds a tree structure from flattened items
 * @param flattenedItems - The flattened items to build the tree from
 * @returns The tree structure
 */
export function buildTreeFromFlattenedItems(flattenedItems: FlattenedItem[]): TreeItem[] {
    if (flattenedItems.length === 0) return [];

    // Single pass optimization: create nodes and group by parent simultaneously
    const nodes: Record<string, TreeItem> = {};
    const childrenByParent: Record<string, TreeItem[]> = { root: [] };

    // Single loop to create nodes and group by parent
    for (const item of flattenedItems) {
        // Create the node
        const node: TreeItem = {
            id: item.id,
            children: [], // Will be populated from childrenByParent
        };
        nodes[item.id] = node;

        // Group by parent (use 'root' for null parent)
        const parentKey = item.parent?.id ?? 'root';
        if (!childrenByParent[parentKey]) {
            childrenByParent[parentKey] = [];
        }
        childrenByParent[parentKey].push(node);
    }

    // Assign children to their parents (only for items that have children)
    for (const [parentId, children] of Object.entries(childrenByParent)) {
        if (parentId === 'root') continue; // Skip root, handle at the end

        const parent = nodes[parentId];
        if (parent) {
            parent.children = children;
        }
    }

    return childrenByParent.root || [];
}
