import { create } from 'zustand';

interface State {
    uploadedFiles: string[];
}

interface Actions {
    addUploadedFile: (files: string) => void;
    reset: () => void;
}

const initialState: State = {
    uploadedFiles: []
};

/**
 * Track uploading status of import files using only the ID of the file.
 */
export const storeUploadImportFiles = create<State & Actions>()((set, get) => ({
    ...initialState,
    reset: () => set(initialState),
    addUploadedFile: (file) => {
        set({ uploadedFiles: [...get().uploadedFiles, file] });
    }
}));
