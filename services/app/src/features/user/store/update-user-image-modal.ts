import { create } from 'zustand';

interface IStoreUpdateUserImageModal {
    isOpen: boolean;
    handleOpen: () => void;
    handleClose: () => void;
}

export const storeUpdateUserImageModal = create<IStoreUpdateUserImageModal>(
    (set) => ({
        isOpen: false,
        handleOpen: () => set({ isOpen: true }),
        handleClose: () => set({ isOpen: false })
    })
);
