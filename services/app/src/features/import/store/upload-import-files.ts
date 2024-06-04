import { z } from 'zod';
import { create } from 'zustand';

import { CreateImportSelectionSchema } from '../schema/create-import';

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
