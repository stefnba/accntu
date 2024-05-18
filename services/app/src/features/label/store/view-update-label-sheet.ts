import { create } from 'zustand';

interface IStoreViewUpdateLabelSheet {
    id?: string;
    view: 'view' | 'update';
    setView: (view: 'view' | 'update') => void;
    isOpen: boolean;
    handleOpen: (id?: string) => void;
    handleClose: () => void;
}

export const storeViewUpdateLabelSheet = create<IStoreViewUpdateLabelSheet>(
    (set) => ({
        isOpen: false,
        view: 'view',
        setView: (view) => set({ view }),
        handleOpen: (id) => set({ isOpen: true, id }),
        handleClose: () => {
            set({ isOpen: false, id: undefined, view: 'view' });
        }
    })
);
