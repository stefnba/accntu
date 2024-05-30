import { create } from 'zustand';

type TView = 'view' | 'update';

interface IStoreViewUpdateTransactionSheet {
    id?: string;
    view: TView;
    setView: (view: TView) => void;
    isOpen: boolean;
    handleOpen: (id?: string, view?: TView) => void;
    handleClose: () => void;
}

export const storeViewUpdateTransactionSheet =
    create<IStoreViewUpdateTransactionSheet>((set) => ({
        isOpen: false,
        view: 'view',
        setView: (view) => set({ view }),
        handleOpen: (id, view) =>
            set({ isOpen: true, id, view: view || 'view' }),
        handleClose: () => {
            set({ isOpen: false, id: undefined, view: 'view' });
        }
    }));
