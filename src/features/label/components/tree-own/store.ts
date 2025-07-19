import { UniqueIdentifier } from '@dnd-kit/core';
import { create } from 'zustand';

interface SortableTreeState {
    expandedIds: Set<UniqueIdentifier>;
}

interface SortableTreeActions {
    setExpandedIds: (expandedIds: Set<UniqueIdentifier>) => void;
    toggleExpandedId: (id: UniqueIdentifier) => void;
}

/**
 * Global store for keep track of expanded items
 */
export const useSortableTreeUIStore = create<SortableTreeState & SortableTreeActions>((set) => ({
    // State
    expandedIds: new Set(),

    // Actions
    setExpandedIds: (expandedIds) => set({ expandedIds }),
    toggleExpandedId: (id) =>
        set((state) => {
            // Create new Set, required to avoid mutating the original Set
            const newExpandedIds = new Set(state.expandedIds);

            if (newExpandedIds.has(id)) {
                newExpandedIds.delete(id);
            } else {
                newExpandedIds.add(id);
            }

            return { expandedIds: newExpandedIds };
        }),
}));
