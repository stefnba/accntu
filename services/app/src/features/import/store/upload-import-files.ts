import { create } from 'zustand';

interface IStoreUploadImportFiles {
    uploadedFiles: string[];
    addUploadedFile: (files: string) => void;
}

export const storeUploadImportFiles = create<IStoreUploadImportFiles>(
    (set) => ({
        uploadedFiles: [],
        addUploadedFile: (file) =>
            set((state) => ({
                uploadedFiles: [...state.uploadedFiles, file]
            }))
    })
);
