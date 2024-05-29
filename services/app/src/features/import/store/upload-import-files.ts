import { z } from 'zod';
import { create } from 'zustand';

import { CreateImportSelectionSchema } from '../schema/create-import';

interface IStoreUploadImportFiles {
    data?: z.infer<typeof CreateImportSelectionSchema>;
    setData: (data: z.infer<typeof CreateImportSelectionSchema>) => void;
    uploadedFiles: string[];
    addUploadedFile: (files: string) => void;
}

export const storeUploadImportFiles = create<IStoreUploadImportFiles>(
    (set) => ({
        setData: (data) => set({ data }),
        data: undefined,
        uploadedFiles: [],
        addUploadedFile: (file) =>
            set((state) => ({
                uploadedFiles: [...state.uploadedFiles, file]
            }))
    })
);
