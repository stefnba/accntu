import { create } from 'zustand';

interface Store {
    id?: string;
    view: 'view' | 'update' | 'create';
    isOpen: boolean;
}

interface Actions {
    setView: (view: 'view' | 'update') => void;
    handleOpen: (params: { id?: string; view?: Store['view'] }) => void;
    handleClose: () => void;
}

const initialState: Store = {
    isOpen: false,
    view: 'view',
    id: undefined
};

export const storeViewUpdateTagSheet = create<Store & Actions>((set) => ({
    ...initialState,
    setView: (view) => set({ view }),
    handleOpen: ({ id, view = 'view' }) => set({ isOpen: true, id, view }),
    handleClose: () => {
        set({ isOpen: false, id: undefined, view: 'view' });
    }
}));
