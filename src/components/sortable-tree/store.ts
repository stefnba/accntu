import { UniqueIdentifier } from '@dnd-kit/core';
import { create } from 'zustand';

interface SortableTreeState {
    // Map of queryKey -> expandedIds
    expandedIdsByTree: Map<string, Set<UniqueIdentifier>>;
}

interface SortableTreeActions {
    getExpandedIds: (treeKey: string) => Set<UniqueIdentifier>;
    setExpandedIds: (treeKey: string, expandedIds: Set<UniqueIdentifier>) => void;
    toggleExpandedId: (treeKey: string, id: UniqueIdentifier) => void;
}

type SortableTreeStore = SortableTreeState & SortableTreeActions;

const useGlobalTreeStore = create<SortableTreeStore>((set, get) => ({
    // ================================
    // State
    // ================================
    expandedIdsByTree: new Map(),

    // ================================
    // Actions
    // ================================
    getExpandedIds: (treeKey: string) => {
        const state = get();
        return state.expandedIdsByTree.get(treeKey) || new Set();
    },

    setExpandedIds: (treeKey: string, expandedIds: Set<UniqueIdentifier>) =>
        set((state) => {
            const newMap = new Map(state.expandedIdsByTree);
            newMap.set(treeKey, expandedIds);
            return { expandedIdsByTree: newMap };
        }),

    toggleExpandedId: (treeKey: string, id: UniqueIdentifier) =>
        set((state) => {
            const newMap = new Map(state.expandedIdsByTree);
            const currentExpanded = newMap.get(treeKey) || new Set();
            const newExpanded = new Set(currentExpanded);

            if (newExpanded.has(id)) {
                newExpanded.delete(id);
            } else {
                newExpanded.add(id);
            }

            newMap.set(treeKey, newExpanded);
            return { expandedIdsByTree: newMap };
        }),
}));

/**
 * Get tree-specific expand state based on queryKey
 */
export const useSortableTreeUIStore = (queryKey: readonly string[]) => {
    const store = useGlobalTreeStore();
    const treeKey = queryKey.join(':');

    return {
        expandedIds: store.getExpandedIds(treeKey),
        setExpandedIds: (expandedIds: Set<UniqueIdentifier>) =>
            store.setExpandedIds(treeKey, expandedIds),
        toggleExpandedId: (id: UniqueIdentifier) => store.toggleExpandedId(treeKey, id),
    };
};
