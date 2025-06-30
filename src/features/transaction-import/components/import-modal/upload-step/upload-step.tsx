'use client';

import { useImportRecordEndpoints } from '@/features/transaction-import/api/import-record';
import { useImportModal } from '@/features/transaction-import/hooks';
import { useState } from 'react';

import { FileDropzone } from '@/features/transaction-import/components/import-modal/upload-step/file-dropzone';
import { FileList } from '@/features/transaction-import/components/import-modal/upload-step/file-list';
import { UploadActions } from '@/features/transaction-import/components/import-modal/upload-step/upload-actions';
import { UploadStatus } from '@/features/transaction-import/components/import-modal/upload-step/upload-status';
import { useFileUpload } from '@/features/transaction-import/hooks';

export const UploadStep = () => {
    const { setCurrentStep, importId } = useImportModal();

    const [isProcessing, setIsProcessing] = useState(false);

    const { mutate: activateImport } = useImportRecordEndpoints.activate({
        onSuccess: (data) => {
            setCurrentStep('processing');
        },
        errorHandlers: {
            default({ error }) {
                alert(error.message);
                setIsProcessing(false);
            },
        },
    });

    const {
        files,
        dropzoneProps,
        removeFile,
        retryUpload,
        completedFilesCount,
        hasErrors,
        completedFiles,
    } = useFileUpload();

    const handleContinue = async () => {
        if (completedFiles.length === 0) {
            alert('Please upload at least one file');
            return;
        }

        if (!importId) {
            alert('No import session found. Please try uploading files again.');
            return;
        }

        setIsProcessing(true);

        // Activate the draft import to move it to 'pending' status
        activateImport({
            param: { id: importId },
        });
    };

    const handleDownload = (fileUpload: any) => {
        // Download or preview file logic
        console.log('Download file:', fileUpload.file.name);
    };

    return (
        <div className="space-y-8 py-8 w-full max-w-full overflow-hidden">
            {/* <UploadHeader /> */}

            <FileDropzone {...dropzoneProps} />

            <FileList
                files={files}
                completedFilesCount={completedFilesCount}
                onRetry={retryUpload}
                onRemove={removeFile}
                onDownload={handleDownload}
            />

            <UploadActions
                completedFilesCount={completedFilesCount}
                isProcessing={isProcessing}
                onContinue={handleContinue}
            />

            <UploadStatus filesCount={files.length} hasErrors={hasErrors} />
        </div>
    );
};
