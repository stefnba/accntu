import { CreateImportSelectionSchema } from '@/features/import/schema/create-import';
import { z } from 'zod';
import { create } from 'zustand';

import { storeCreateImportData } from './create-import-data';
import { storeUploadImportFiles } from './upload-import-files';

const steps = ['selection', 'uploading', 'preview', 'success'] as const;

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
    handleOpen: (step?: (typeof steps)[number], reset?: boolean) => void;
    handleClose: () => void;
}

export const storeCreateImportModal = create<State & Actions>()((set) => ({
    ...initialState,

    // steps
    handleStep: (step) => set({ step }),

    // visibility
    handleOpen: (step = 'selection', reset = true) => {
        // reset import data and uploaded files if requested
        if (reset) {
            storeCreateImportData.getState().reset();
            storeUploadImportFiles.getState().reset();
        }

        set({ isOpen: true, step });
    },
    handleClose: () => {
        set({ isOpen: false });
    }
}));
