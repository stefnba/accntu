import { parseAsBoolean, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';

export type ImportStep = 'accountSelection' | 'upload' | 'processing' | 'preview' | 'success';

const IMPORT_STEPS = ['accountSelection', 'upload', 'processing', 'preview', 'success'] as const;

/**
 * Hook to manage the import modal state
 */
export const useImportModal = () => {
    const defaultStep: ImportStep = 'accountSelection';

    const [modalOpen, setModalOpen] = useQueryState(
        'importModal',
        parseAsBoolean.withDefault(false)
    );

    const [currentStep, setCurrentStep] = useQueryState(
        'importStep',
        parseAsStringLiteral(IMPORT_STEPS).withDefault(defaultStep)
    );

    const [importId, setImportId] = useQueryState('importId', parseAsString.withDefault(''));

    const [fileName, setFileName] = useQueryState('fileName', parseAsString.withDefault(''));

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
        setFileName('', { clearOnDefault: true });

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
        setFileName('', { clearOnDefault: true });
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
        fileName: fileName || null,
        setFileName: (name: string | null) => setFileName(name || '', { clearOnDefault: !name }),
        connectedBankAccountId: connectedBankAccountId || null,
        setConnectedBankAccountId: (id: string | null) =>
            setConnectedBankAccountId(id || '', { clearOnDefault: !id }),

        // Actions
        reset,
        resetFormState,
    };
};

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useImportFileEndpoints } from './api';
import { allowedFileTypes, maxFileSize } from './config';
// import { uploadFileToS3 } from './s3-utils';
import { uploadFileToS3WithSignedUrl } from '@/lib/upload/cloud/s3/services';
import type { FileUpload } from './types';

export const useFileUpload = () => {
    const [files, setFiles] = useState<FileUpload[]>([]);

    const getSignedUrlQuery = useImportFileEndpoints.getSignedUrl;

    /**
     * Upload a file to S3
     * @param fileUpload - The file to upload
     * @returns - The signed URL
     */
    const uploadFileToS3 = async (fileUpload: FileUpload) => {
        // Get signed URL
        const { data } = getSignedUrlQuery({
            query: {
                fileType: fileUpload.file.type,
                fileSize: fileUpload.file.size.toString(),
                checksum: fileUpload.file.name,
                bucket: process.env.NEXT_PUBLIC_S3_BUCKET || 'accntu-uploads',
            },
        });

        if (!data) {
            throw new Error('Failed to get signed URL');
        }

        const { success } = await uploadFileToS3WithSignedUrl(data.url, fileUpload.file);

        return { success, key: data.key, bucket: data.bucket };
    };

    const uploadFile = async (fileUpload: FileUpload) => {
        try {
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileUpload.id ? { ...f, status: 'uploading' as const, progress: 0 } : f
                )
            );

            const { success, key, bucket } = await uploadFileToS3(fileUpload);

            if (!success) {
                throw new Error('Failed to upload file to S3');
            }

            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileUpload.id
                        ? { ...f, status: 'completed' as const, progress: 100, key }
                        : f
                )
            );
        } catch (error) {
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileUpload.id
                        ? {
                              ...f,
                              status: 'error' as const,
                              error: error instanceof Error ? error.message : 'Upload failed',
                          }
                        : f
                )
            );
            throw error;
        }
    };

    /**
     * Handle file drops
     * @param acceptedFiles - The accepted files
     * @param rejectedFiles - The rejected files
     */
    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        // Handle rejected files
        rejectedFiles.forEach(({ file, errors }) => {
            console.error(`File ${file.name} rejected:`, errors);
        });

        // Add accepted files to upload queue
        const newFiles: FileUpload[] = acceptedFiles.map((file) => ({
            id: `${Date.now()}-${Math.random()}`,
            file,
            progress: 0,
            status: 'pending' as const,
        }));

        setFiles((prev) => [...prev, ...newFiles]);

        // Start uploading files automatically
        newFiles.forEach((fileUpload) => {
            uploadFile(fileUpload);
        });
    }, []);

    /**
     * Use the dropzone hook to handle file uploads
     * @returns - The root props, input props, and whether the dropzone is active
     */
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: allowedFileTypes,
        maxSize: maxFileSize,
        multiple: true,
    });

    /**
     * Remove a file from the upload queue
     * @param fileId - The ID of the file to remove
     */
    const removeFile = (fileId: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
    };

    /**
     * Remove a file from the upload queue
     * @param fileId - The ID of the file to remove
     */
    const retryUpload = (fileId: string) => {
        const fileUpload = files.find((f) => f.id === fileId);
        if (fileUpload) {
            uploadFile(fileUpload);
        }
    };

    const completedFilesCount = files.filter((f) => f.status === 'completed').length;
    const hasErrors = files.some((f) => f.status === 'error');

    return {
        files,
        removeFile,
        retryUpload,
        completedFilesCount,
        hasErrors,
        dropZoneProps: {
            getRootProps,
            getInputProps,
            isDragActive,
        },
    };
};
