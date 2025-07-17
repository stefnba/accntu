import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { TreeItems, FlattenedItem, TreeProjection } from '../types';
import { removeItem, setProperty, flattenTree, buildTree, cloneItems, removeChildrenOf } from '../utils/tree-utils';

interface TreeStore {
    // State
    items: TreeItems;
    activeId: UniqueIdentifier | null;
    overId: UniqueIdentifier | null;
    offsetLeft: number;
    currentPosition: {
        parentId: UniqueIdentifier | null;
        overId: UniqueIdentifier;
    } | null;
    
    // Computed state
    flattenedItems: FlattenedItem[];
    collapsedItems: string[];
    sortedIds: string[];
    
    // Actions
    setItems: (items: TreeItems) => void;
    initializeTree: (items: TreeItems) => void;
    
    // Drag operations
    startDrag: (activeId: UniqueIdentifier, currentPosition?: TreeStore['currentPosition']) => void;
    moveDrag: (offsetLeft: number) => void;
    overDrag: (overId: UniqueIdentifier | null) => void;
    endDrag: (newItems: TreeItems) => void;
    cancelDrag: () => void;
    
    // Tree operations
    removeItem: (id: UniqueIdentifier) => void;
    toggleCollapse: (id: UniqueIdentifier) => void;
    
    // Utility actions
    reset: () => void;
    updateFlattenedItems: () => void;
}

export const useTreeStore = create<TreeStore>()(
    devtools(
        (set, get) => ({
            // Initial state
            items: [],
            activeId: null,
            overId: null,
            offsetLeft: 0,
            currentPosition: null,
            flattenedItems: [],
            collapsedItems: [],
            sortedIds: [],
            
            // Actions
            setItems: (items) => {
                set({ items }, false, 'setItems');
                get().updateFlattenedItems();
            },
            
            initializeTree: (items) => {
                set({ 
                    items,
                    activeId: null,
                    overId: null,
                    offsetLeft: 0,
                    currentPosition: null,
                }, false, 'initializeTree');
                get().updateFlattenedItems();
            },
            
            startDrag: (activeId, currentPosition = null) => {
                set({ 
                    activeId,
                    overId: activeId,
                    currentPosition,
                }, false, 'startDrag');
                get().updateFlattenedItems();
            },
            
            moveDrag: (offsetLeft) => {
                set({ offsetLeft }, false, 'moveDrag');
            },
            
            overDrag: (overId) => {
                set({ overId }, false, 'overDrag');
            },
            
            endDrag: (newItems) => {
                set({ 
                    items: newItems,
                    activeId: null,
                    overId: null,
                    offsetLeft: 0,
                    currentPosition: null,
                }, false, 'endDrag');
                get().updateFlattenedItems();
            },
            
            cancelDrag: () => {
                set({ 
                    activeId: null,
                    overId: null,
                    offsetLeft: 0,
                    currentPosition: null,
                }, false, 'cancelDrag');
            },
            
            removeItem: (id) => {
                const { items } = get();
                const newItems = removeItem(items, id);
                set({ items: newItems }, false, 'removeItem');
                get().updateFlattenedItems();
            },
            
            toggleCollapse: (id) => {
                const { items } = get();
                const newItems = setProperty(items, id, 'collapsed', (value) => !value);
                set({ items: newItems }, false, 'toggleCollapse');
                get().updateFlattenedItems();
            },
            
            reset: () => {
                set({
                    items: [],
                    activeId: null,
                    overId: null,
                    offsetLeft: 0,
                    currentPosition: null,
                    flattenedItems: [],
                    collapsedItems: [],
                }, false, 'reset');
            },
            
            updateFlattenedItems: () => {
                const { items, activeId } = get();
                const flattenedTree = flattenTree(items);
                
                const collapsedItems = flattenedTree.reduce<string[]>(
                    (acc, { children, collapsed, id }) =>
                        collapsed && children.length ? [...acc, String(id)] : acc,
                    []
                );
                
                // Use the existing removeChildrenOf utility function
                const excludeIds = activeId ? [activeId, ...collapsedItems.map(id => id as UniqueIdentifier)] : collapsedItems.map(id => id as UniqueIdentifier);
                const filteredItems = removeChildrenOf(flattenedTree, excludeIds);
                const sortedIds = filteredItems.map(item => String(item.id));
                
                set({ 
                    flattenedItems: filteredItems,
                    collapsedItems,
                    sortedIds,
                }, false, 'updateFlattenedItems');
            },
        }),
        {
            name: 'tree-store',
        }
    )
);

// Selectors for performance optimization
export const useTreeItems = () => useTreeStore(state => state.items);
export const useFlattenedItems = () => useTreeStore(state => state.flattenedItems);
export const useActiveId = () => useTreeStore(state => state.activeId);
export const useOverId = () => useTreeStore(state => state.overId);
export const useOffsetLeft = () => useTreeStore(state => state.offsetLeft);
export const useCurrentPosition = () => useTreeStore(state => state.currentPosition);
export const useIsDragging = () => useTreeStore(state => state.activeId !== null);
export const useCollapsedItems = () => useTreeStore(state => state.collapsedItems);

// Individual action selectors to prevent object recreation
export const useSetItems = () => useTreeStore(state => state.setItems);
export const useInitializeTree = () => useTreeStore(state => state.initializeTree);
export const useStartDrag = () => useTreeStore(state => state.startDrag);
export const useMoveDrag = () => useTreeStore(state => state.moveDrag);
export const useOverDrag = () => useTreeStore(state => state.overDrag);
export const useEndDrag = () => useTreeStore(state => state.endDrag);
export const useCancelDrag = () => useTreeStore(state => state.cancelDrag);
export const useRemoveItem = () => useTreeStore(state => state.removeItem);
export const useToggleCollapse = () => useTreeStore(state => state.toggleCollapse);
export const useReset = () => useTreeStore(state => state.reset);

// Convenience hook that returns individual actions (use sparingly)
export const useTreeActions = () => ({
    setItems: useSetItems(),
    initializeTree: useInitializeTree(),
    startDrag: useStartDrag(),
    moveDrag: useMoveDrag(),
    overDrag: useOverDrag(),
    endDrag: useEndDrag(),
    cancelDrag: useCancelDrag(),
    removeItem: useRemoveItem(),
    toggleCollapse: useToggleCollapse(),
    reset: useReset(),
});

// Specific selectors for components with proper caching
export const useTreeItemById = (id: UniqueIdentifier) => 
    useTreeStore(state => state.flattenedItems.find(item => item.id === id));

export const useActiveItem = () => 
    useTreeStore(state => {
        const { activeId, flattenedItems } = state;
        return activeId ? flattenedItems.find(item => item.id === activeId) : null;
    });

// Use the cached sorted IDs from the store
export const useSortedIds = () => useTreeStore(state => state.sortedIds);