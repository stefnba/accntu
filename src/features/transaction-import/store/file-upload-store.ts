import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { FileUpload } from '../types';

type FileUploadState = {
    files: FileUpload[];
};

type FileUploadActions = {
    // Actions
    addFiles: (files: FileUpload[]) => FileUpload[]; // Returns actually added files
    updateFile: (fileId: string, updates: Partial<FileUpload>) => void;
    removeFile: (fileId: string) => void;
    clearFiles: () => void;

    // Computed values
    getCompletedFilesCount: () => number;
    getHasErrors: () => boolean;
    getCompletedFiles: () => FileUpload[];
};

/**
 * Store to manage file uploads
 */
export const useFileUploadStore = create<FileUploadState & FileUploadActions>()(
    devtools(
        (set, get) => ({
            files: [],

            /**
             * Add files to the store
             * @param newFiles - The files to add
             * @returns The files that were actually added (excludes duplicates)
             */
            addFiles: (newFiles) => {
                let filesToAdd: FileUpload[] = [];

                set((state) => {
                    const existingFileIds = new Set(state.files.map((f) => f.id));

                    newFiles.forEach((newFile) => {
                        if (existingFileIds.has(newFile.id)) {
                            console.log(
                                `Duplicate file detected: ${newFile.file.name} (ID: ${newFile.id})`
                            );
                        } else {
                            filesToAdd.push(newFile);
                        }
                    });

                    return {
                        files: [...state.files, ...filesToAdd],
                    };
                });

                return filesToAdd;
            },

            updateFile: (fileId, updates) => {
                set((state) => ({
                    files: state.files.map((file) =>
                        file.id === fileId ? { ...file, ...updates } : file
                    ),
                }));
            },

            /**
             * Remove a file from the store
             * @param fileId - The ID of the file to remove
             */
            removeFile: (fileId) => {
                set((state) => ({
                    files: state.files.filter((file) => file.id !== fileId),
                }));
            },

            /**
             * Clear all files from the store
             */
            clearFiles: () => {
                set({ files: [] });
            },

            /**
             * Get the number of completed files
             * @returns The number of completed files
             */
            getCompletedFilesCount: () => {
                return get().files.filter((f) => f.status === 'completed').length;
            },

            /**
             * Check if there are any errors in the files
             * @returns True if there are any errors, false otherwise
             */
            getHasErrors: () => {
                return get().files.some((f) => f.status === 'error');
            },

            /**
             * Get all completed files
             * @returns All completed files
             */
            getCompletedFiles: () => {
                return get().files.filter((f) => f.status === 'completed');
            },
        }),
        {
            name: 'file-upload-store',
        }
    )
);
