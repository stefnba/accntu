export interface LabelTreeItem {
    id: string;
    name: string;
    icon?: string;
    color?: string;
    parentId?: string | null;
    sortOrder?: number;
    children?: LabelTreeItem[];
}

export interface FlattenedItem extends LabelTreeItem {
    depth: number;
    parentId: string | null;
    index: number;
}

export interface TreeItem extends LabelTreeItem {
    children?: TreeItem[];
}

export interface DropProjection {
    depth: number;
    parentId: string | null;
    insertIndex: number;
    overId: string;
}

const INDENTATION_WIDTH = 32; // 2rem = 32px

export const flatten = (
    items: TreeItem[],
    parentId: string | null = null,
    depth = 0,
    expandedItems?: Set<string>
): FlattenedItem[] => {
    return items.reduce<FlattenedItem[]>((acc, item, index) => {
        const flatItem: FlattenedItem = {
            ...item,
            depth,
            parentId,
            index,
        };

        acc.push(flatItem);

        // Only include children if the item is expanded (or if expandedItems is not provided)
        if (item.children?.length && (!expandedItems || expandedItems.has(item.id))) {
            acc.push(...flatten(item.children, item.id, depth + 1, expandedItems));
        }

        return acc;
    }, []);
};

export const buildTree = (flatItems: FlattenedItem[]): TreeItem[] => {
    const tree: TreeItem[] = [];
    const childrenMap: { [key: string]: TreeItem[] } = {};

    for (const item of flatItems) {
        const { depth: _depth, index: _index, ...treeItemData } = item;
        const treeItem: TreeItem = treeItemData;

        if (item.parentId) {
            childrenMap[item.parentId] = childrenMap[item.parentId] || [];
            childrenMap[item.parentId].push(treeItem);
        } else {
            tree.push(treeItem);
        }
    }

    const attachChildren = (items: TreeItem[]) => {
        for (const item of items) {
            if (childrenMap[item.id]) {
                item.children = childrenMap[item.id];
                attachChildren(item.children);
            }
        }
    };

    attachChildren(tree);
    return tree;
};

export const findItem = (items: TreeItem[], itemId: string): TreeItem | null => {
    for (const item of items) {
        if (item.id === itemId) {
            return item;
        }

        if (item.children?.length) {
            const found = findItem(item.children, itemId);
            if (found) {
                return found;
            }
        }
    }

    return null;
};

export const removeItem = (items: TreeItem[], itemId: string): TreeItem[] => {
    return items.reduce<TreeItem[]>((acc, item) => {
        if (item.id === itemId) {
            return acc;
        }

        if (item.children?.length) {
            const filteredChildren = removeItem(item.children, itemId);
            acc.push({ ...item, children: filteredChildren });
        } else {
            acc.push(item);
        }

        return acc;
    }, []);
};

export const getDragDepth = (offset: number, indentationWidth: number = INDENTATION_WIDTH): number => {
    return Math.round(offset / indentationWidth);
};

export const getMaxDepth = (previousItem: FlattenedItem | null): number => {
    if (previousItem) {
        return previousItem.depth + 1;
    }

    return 0;
};

export const getMinDepth = (nextItem: FlattenedItem | null): number => {
    if (nextItem) {
        return nextItem.depth;
    }

    return 0;
};

export const getProjectedDepth = (
    offset: number,
    activeDepth: number,
    maxDepth: number,
    minDepth: number
): number => {
    const dragDepth = getDragDepth(offset);
    const projectedDepth = activeDepth + dragDepth;

    return Math.min(Math.max(projectedDepth, minDepth), maxDepth);
};

export const getProjection = (
    items: FlattenedItem[],
    activeId: string,
    overId: string,
    dragOffset: number
): DropProjection | null => {
    const overIndex = items.findIndex(({ id }) => id === overId);
    const activeIndex = items.findIndex(({ id }) => id === activeId);

    if (overIndex === -1 || activeIndex === -1) {
        return null;
    }

    const activeItem = items[activeIndex];
    const overItem = items[overIndex];

    const nextItem = items[overIndex + 1];
    const previousItem = items[overIndex - 1];

    const maxDepth = getMaxDepth(previousItem);
    const minDepth = getMinDepth(nextItem);

    const projectedDepth = getProjectedDepth(
        dragOffset,
        activeItem.depth,
        maxDepth,
        minDepth
    );

    let parentId: string | null = null;
    
    if (projectedDepth === overItem.depth + 1) {
        parentId = overItem.id;
    } else if (projectedDepth === overItem.depth) {
        parentId = overItem.parentId;
    } else if (projectedDepth < overItem.depth) {
        for (let i = overIndex - 1; i >= 0; i--) {
            const item = items[i];
            if (item.depth === projectedDepth - 1) {
                parentId = item.id;
                break;
            }
            if (item.depth < projectedDepth - 1) {
                parentId = item.parentId;
                break;
            }
        }
    }

    return {
        depth: projectedDepth,
        parentId,
        insertIndex: overIndex,
        overId,
    };
};

export const adjustTree = (
    items: TreeItem[],
    activeId: string,
    projection: DropProjection
): TreeItem[] => {
    const flatItems = flatten(items);
    const activeItem = flatItems.find(item => item.id === activeId);
    
    if (!activeItem) {
        return items;
    }

    const withoutActive = removeItem(items, activeId);
    const newFlatItems = flatten(withoutActive);

    const insertAtIndex = newFlatItems.findIndex(item => item.id === projection.overId);
    
    const updatedItem: FlattenedItem = {
        ...activeItem,
        depth: projection.depth,
        parentId: projection.parentId,
        index: insertAtIndex,
    };

    newFlatItems.splice(insertAtIndex, 0, updatedItem);

    return buildTree(newFlatItems);
};