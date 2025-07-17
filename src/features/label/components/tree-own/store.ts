import { FlattenedItem, TreeItem } from '@/features/label/components/tree-own/types';
import { UniqueIdentifier } from '@dnd-kit/core';
import { create } from 'zustand';

interface SortableTreeState {
    items: TreeItem[];
    flattenedItems: FlattenedItem[];
    collapsedItems: Set<UniqueIdentifier>;
    sortableIds: Set<UniqueIdentifier>;
}

interface SortableTreeActions {
    setItems: (items: TreeItem[]) => void;
    setFlattenedItems: (flattenedItems: FlattenedItem[]) => void;
    setCollapsedItems: (collapsedItems: Set<UniqueIdentifier>) => void;
    setSortableIds: (sortableIds: Set<UniqueIdentifier>) => void;
}

const useSortableTreeStore = create<SortableTreeState & SortableTreeActions>((set) => ({
    // State
    items: [],
    flattenedItems: [],
    collapsedItems: new Set(),
    sortableIds: new Set(),

    // Actions
    setItems: (items) => set({ items }),
    setFlattenedItems: (flattenedItems) => set({ flattenedItems }),
    setCollapsedItems: (collapsedItems) => set({ collapsedItems }),
    setSortableIds: (sortableIds) => set({ sortableIds }),
}));

export default useSortableTreeStore;
