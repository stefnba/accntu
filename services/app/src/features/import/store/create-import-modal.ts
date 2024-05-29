import { create } from 'zustand';

const steps = ['selection', 'uploading', 'preview', 'importing'] as const;

interface IStoreCreateImportModal {
    // steps
    step: (typeof steps)[number];
    handleStep: (step: (typeof steps)[number]) => void;

    // import id
    importId?: string;
    setImportId: (importId: string) => void;

    // visibility
    isOpen: boolean;
    handleOpen: () => void;
    handleClose: () => void;
}

export const storeCreateImportModal = create<IStoreCreateImportModal>(
    (set) => ({
        // steps
        step: 'preview',
        handleStep: (step) => set({ step }),

        // import id
        importId: 'wdjdlhx80v61x14fcu0i0r0j',
        setImportId: (importId) => set({ importId }),

        // visibility
        isOpen: false,
        handleOpen: () => set({ isOpen: true, step: 'preview' }),
        handleClose: () => {
            set({ isOpen: false });
        }
    })
);
