import { CreateImportSelectionSchema } from '@/features/import/schema/create-import';
import { z } from 'zod';
import { create } from 'zustand';

const steps = [
    'selection',
    'uploading',
    'preview',
    'importing',
    'success'
] as const;

interface IStoreCreateImportModal {
    // steps
    step: (typeof steps)[number];
    handleStep: (step: (typeof steps)[number]) => void;

    // import id
    importId?: string;
    setImportId: (importId: string) => void;

    // import data (files and account id)
    importData?: z.infer<typeof CreateImportSelectionSchema>;
    setImportData: (data: z.infer<typeof CreateImportSelectionSchema>) => void;

    // visibility
    isOpen: boolean;
    handleOpen: () => void;
    handleClose: () => void;

    // contine
    handleContinue: (importId: string, accountId: string) => void;
}

export const storeCreateImportModal = create<IStoreCreateImportModal>(
    (set) => ({
        // steps
        step: 'selection',
        handleStep: (step) => set({ step }),

        // import data
        importData: undefined,
        setImportData: (data) => set({ importData: data }),

        // import id
        importId: undefined,
        setImportId: (importId) => set({ importId }),

        // visibility
        isOpen: false,
        handleOpen: () => set({ isOpen: true, step: 'selection' }),
        handleClose: () => {
            set({ isOpen: false });
        },

        // contine
        handleContinue: (importId, accountId) =>
            set({
                isOpen: true,
                importId,
                step: 'preview',
                importData: { accountId, files: [] }
            })
    })
);
