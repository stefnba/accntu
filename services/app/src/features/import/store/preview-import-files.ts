import { create } from 'zustand';

interface IStorePreviewImportFiles {
    // file
    fileId: string;
    setFileId: (fileId: string) => void;
}

export const storePreviewImportFiles = create<IStorePreviewImportFiles>(
    (set) => ({
        fileId: 'wdjdlhx80v61x14fcu0i0r0j',
        setFileId: (fileId) => set({ fileId })
    })
);
