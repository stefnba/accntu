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

export const storeCreateImportModal = create<State & Actions>()((set) => ({
    ...initialState,

    // steps
    handleStep: (step) => set({ step }),

    // visibility
    handleOpen: () => set({ isOpen: true, step: 'selection' }),
    handleClose: () => {
        set({ isOpen: false });
    }
}));
