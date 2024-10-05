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

interface State {
    step: (typeof steps)[number];
    isOpen: boolean;
}

const initialState: State = {
    step: 'selection',
    isOpen: false
};

interface Actions {
    handleStep: (step: (typeof steps)[number]) => void;
    handleOpen: () => void;
    handleClose: () => void;
}

interface IStoreCreateImportModal {
    // steps
    step: (typeof steps)[number];
    handleStep: (step: (typeof steps)[number]) => void;

    // import id
    importId?: string;
    setImportId: (importId: string) => void;
    resetImportId: () => void;

    // import data (files and account id)
    importData?: z.infer<typeof CreateImportSelectionSchema>;
    setImportData: (data: z.infer<typeof CreateImportSelectionSchema>) => void;
    resetImportData: () => void;

    // visibility
    isOpen: boolean;
    handleOpen: () => void;
    handleClose: () => void;

    // contine
    handleContinue: (importId: string, accountId: string) => void;
}

export const storeCreateImportModal = create<State & Actions>()((set, get) => ({
    ...initialState,

    // steps
    handleStep: (step) => set({ step }),

    // visibility
    handleOpen: () => set({ isOpen: true, step: 'selection' }),
    handleClose: () => {
        set({ isOpen: false });
    }

    // import data
    // importData: undefined,
    // setImportData: (data) => set({ importData: data }),
    // resetImportData: () => set({ importData: undefined }),

    // // import id
    // importId: undefined,
    // setImportId: (importId) => set({ importId }),
    // resetImportId: () => set({ importId: undefined }),

    // visibility

    // // contine
    // handleContinue: (importId, accountId) =>
    //     set({
    //         isOpen: true,
    //         importId,
    //         step: 'preview',
    //         importData: { accountId, files: [] }
    //     })
}));
