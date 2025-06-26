import { parseAsBoolean, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { allowedFileTypes, maxFileSize } from './config';
import { useFileUploadStore } from './store/file-upload-store';

import { useImportFileEndpoints } from '@/features/transaction-import/api';
import { uploadFileToS3WithSignedUrl } from '@/lib/upload/cloud/s3/services';
import { computeSHA256 } from '@/lib/upload/utils';
import type { FileUpload } from './types';

const IMPORT_STEPS = ['accountSelection', 'upload', 'processing', 'preview', 'success'] as const;
export type TImportStep = (typeof IMPORT_STEPS)[number];

/**
 * Hook to manage the import modal state
 * @returns The import modal state
 */
export const useImportModal = () => {
    const defaultStep: TImportStep = 'accountSelection';

    const [modalOpen, setModalOpen] = useQueryState(
        'importModal',
        parseAsBoolean.withDefault(false)
    );

    const [currentStep, setCurrentStep] = useQueryState(
        'importStep',
        parseAsStringLiteral(IMPORT_STEPS).withDefault(defaultStep)
    );

    const [importId, setImportId] = useQueryState('importId', parseAsString.withDefault(''));

    const [connectedBankAccountId, setConnectedBankAccountId] = useQueryState(
        'importAccountId',
        parseAsString.withDefault('')
    );

    // Note: parsedTransactions is complex data that shouldn't be stored in URL
    // We'll handle this separately, possibly with a separate state management solution
    // or by fetching it based on importId when needed

    const openModal = (accountId?: string) => {
        setModalOpen(true);
        setCurrentStep(accountId ? 'upload' : defaultStep);

        // Reset only the form fields that should be cleared when opening
        setImportId('', { clearOnDefault: true });

        // Set the account ID if provided, otherwise clear it
        if (accountId) {
            setConnectedBankAccountId(accountId);
        } else {
            setConnectedBankAccountId('', { clearOnDefault: true });
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        resetFormState();
    };

    const resetFormState = () => {
        setImportId('', { clearOnDefault: true });
        setConnectedBankAccountId('', { clearOnDefault: true });
        setCurrentStep(defaultStep, { clearOnDefault: true });
    };

    const reset = () => {
        setModalOpen(false);
        resetFormState();
    };

    return {
        // Modal state
        modalOpen,
        setModalOpen,
        openModal,
        closeModal,

        // Steps
        currentStep,
        setCurrentStep,

        // Form state
        importId: importId || null,
        setImportId: (id: string | null) => setImportId(id || '', { clearOnDefault: !id }),
        connectedBankAccountId: connectedBankAccountId || null,
        setConnectedBankAccountId: (id: string | null) =>
            setConnectedBankAccountId(id || '', { clearOnDefault: !id }),

        // Actions
        reset,
        resetFormState,
    };
};

/**
 * Hook to manage file uploads.
 * This hook is used to manage the file uploads and the file upload store.
 * It is used to add files to the store, remove files from the store, and upload files to the store.
 * It is also used to get the files from the store, the completed files count, the has errors, and the completed files.
 * It is also used to get the dropzone props.
 * It is also used to retry uploading a file.
 * It is also used to get the files from the store, the completed files count, the has errors, and the completed files.
 * It is also used to get the dropzone props.
 */
export const useFileUpload = () => {
    const {
        files,
        addFiles,
        removeFile,
        updateFile,
        getCompletedFilesCount,
        getHasErrors,
        getCompletedFiles,
    } = useFileUploadStore();

    // Initialize the signed URL mutation hook at the top level
    const { mutateAsync: createSignedUrl } = useImportFileEndpoints.createS3SignedUrl();

    /**
     * Upload a file
     * @param fileUpload - The file to upload
     */
    const uploadFile = useCallback(
        async (fileUpload: FileUpload) => {
            const fileId = fileUpload.id;
            let progressInterval: NodeJS.Timeout | null = null;

            try {
                // Update status to uploading
                updateFile(fileId, { status: 'uploading', progress: 0 });

                // Simulate upload progress - more realistic progression
                let currentProgress = 0;
                progressInterval = setInterval(() => {
                    currentProgress += Math.random() * 15 + 5; // Random progress between 5-20%
                    const progress = Math.min(currentProgress, 90);
                    updateFile(fileId, { progress });

                    if (currentProgress >= 90) {
                        clearInterval(progressInterval!);
                    }
                }, 300);

                // Create signed URL from API using mutation
                const signedUrlData = await createSignedUrl({
                    json: {
                        fileType: fileUpload.file.type,
                        fileSize: fileUpload.file.size,
                        checksum: await computeSHA256(fileUpload.file),
                    },
                });

                if (!signedUrlData?.url) {
                    throw new Error('Failed to create signed URL');
                }

                const { success, file } = await uploadFileToS3WithSignedUrl({
                    url: signedUrlData.url,
                    file: fileUpload.file,
                });

                if (!success) {
                    throw new Error('Failed to upload file to S3');
                }

                if (progressInterval) clearInterval(progressInterval);

                // Complete upload
                updateFile(fileId, {
                    status: 'completed',
                    progress: 100,
                    s3Key: file.filename,
                    uploadUrl: file.url,
                });
            } catch (error) {
                if (progressInterval) clearInterval(progressInterval);
                updateFile(fileId, {
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Upload failed',
                });
            }
        },
        [updateFile, createSignedUrl]
    );

    /**
     * Handle file drops
     * @param acceptedFiles - The accepted files
     * @param rejectedFiles - The rejected files
     */
    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: any[]) => {
            // Handle rejected files
            rejectedFiles.forEach(({ file, errors }) => {
                console.error(`File ${file.name} rejected:`, errors);
            });

            // Add accepted files to upload queue
            const newFiles: FileUpload[] = acceptedFiles.map((file) => ({
                id: file.name + file.size + file.lastModified,
                file,
                progress: 0,
                status: 'pending',
            }));

            // Add files to the store - this returns only the actually added files (excludes duplicates)
            const actuallyAddedFiles = addFiles(newFiles);

            // Start uploading only the files that were actually added (not duplicates)
            actuallyAddedFiles.forEach((fileUpload) => {
                uploadFile(fileUpload);
            });
        },
        [addFiles, uploadFile]
    );

    /**
     * Use the dropzone hook to handle file uploads
     */
    const dropzoneProps = useDropzone({
        onDrop,
        accept: allowedFileTypes,
        maxSize: maxFileSize,
        multiple: true,
    });

    /**
     * Retry uploading a file
     * @param fileId - The ID of the file to retry
     */
    const retryUpload = (fileId: string) => {
        const fileUpload = files.find((f: FileUpload) => f.id === fileId);
        if (fileUpload) {
            uploadFile(fileUpload);
        }
    };

    return {
        files,
        removeFile,
        retryUpload,
        completedFilesCount: getCompletedFilesCount(),
        hasErrors: getHasErrors(),
        completedFiles: getCompletedFiles(),
        dropzoneProps,
    };
};
