import { create } from 'zustand';

interface Store {
    id?: string;
    view: 'view' | 'update';
    isOpen: boolean;
}

interface Actions {
    setView: (view: 'view' | 'update') => void;

    handleOpen: (id?: string) => void;
    handleClose: () => void;
}

const initialState: Store = {
    isOpen: false,
    view: 'view'
};

export const storeViewUpdateTagSheet = create<Store & Actions>((set) => ({
    ...initialState,
    setView: (view) => set({ view }),
    handleOpen: (id) => set({ isOpen: true, id }),
    handleClose: () => {
        set({ isOpen: false, id: undefined, view: 'view' });
    }
}));
