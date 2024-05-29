import { create } from 'zustand';

interface IStoreViewImportSheet {
    id?: string;
    isOpen: boolean;
    handleOpen: (id?: string) => void;
    handleClose: () => void;
}

export const storeViewImportSheet = create<IStoreViewImportSheet>((set) => ({
    isOpen: false,
    handleOpen: (id) => set({ isOpen: true, id }),
    handleClose: () => {
        set({ isOpen: false, id: undefined });
    }
}));
