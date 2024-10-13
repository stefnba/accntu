import { create } from 'zustand';

interface IStoreUpdateConnectedBankSheet {
    id?: string;
    isOpen: boolean;
    handleOpen: (id: string) => void;
    handleClose: () => void;
}

/**
 * Store for displaying Sheet Component of viewing and editing a Bank connection.
 */
export const storeUpdateConnectedBankSheet =
    create<IStoreUpdateConnectedBankSheet>((set) => ({
        isOpen: false,
        handleOpen: (id) => set({ isOpen: true, id }),
        handleClose: () => {
            set({ isOpen: false, id: undefined });
        }
    }));
