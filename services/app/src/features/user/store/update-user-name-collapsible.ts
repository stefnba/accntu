import { create } from 'zustand';

interface IStoreUpdateUserNameCollapsible {
    isOpen: boolean;
    handleOpenChange: (open: boolean) => void;
    handleOpen: () => void;
    handleClose: () => void;
}

export const storeUpdateUserNameCollapsible =
    create<IStoreUpdateUserNameCollapsible>((set) => ({
        isOpen: false,
        handleOpenChange: (open) => set({ isOpen: open }),
        handleOpen: () => set({ isOpen: true }),
        handleClose: () => set({ isOpen: false })
    }));
