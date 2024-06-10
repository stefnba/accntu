import { create } from 'zustand';

interface IStorePreviewImportFiles {
    // file
    fileId?: string;
    setFileId: (fileId: string) => void;
}

export const storePreviewImportFiles = create<IStorePreviewImportFiles>(
    (set) => ({
        fileId: undefined,
        setFileId: (fileId) => set({ fileId })
    })
);
