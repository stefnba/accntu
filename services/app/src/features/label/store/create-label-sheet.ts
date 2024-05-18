import { create } from 'zustand';

interface IStoreCreateLabelSheet {
    isOpen: boolean;
    handleOpen: (id?: string) => void;
    handleClose: () => void;
}

export const storeCreateLabelSheet = create<IStoreCreateLabelSheet>((set) => ({
    isOpen: false,
    handleOpen: () => set({ isOpen: true }),
    handleClose: () => {
        set({ isOpen: false });
    }
}));
