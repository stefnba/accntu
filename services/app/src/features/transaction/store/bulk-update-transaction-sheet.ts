import { create } from 'zustand';

interface IStoreBulkUpdateTransactionSheet {
    isOpen: boolean;
    handleOpen: () => void;
    handleClose: () => void;
}

export const storeBulkUpdateTransactionSheet =
    create<IStoreBulkUpdateTransactionSheet>((set) => ({
        isOpen: false,
        handleOpen: () => set({ isOpen: true }),
        handleClose: () => {
            set({ isOpen: false });
        }
    }));
