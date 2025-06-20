'use client';

import { useConnectedBankEndpoints } from '@/features/bank/api';
import { useImportFileEndpoints } from '@/features/transaction-import/api';
import { useImportModal } from '@/features/transaction-import/hooks';
import { useState } from 'react';

import { FileDropzone } from '@/features/transaction-import/components/import-modal/upload-step/file-dropzone';
import { FileList } from '@/features/transaction-import/components/import-modal/upload-step/file-list';
import { UploadActions } from '@/features/transaction-import/components/import-modal/upload-step/upload-actions';
import { UploadStatus } from '@/features/transaction-import/components/import-modal/upload-step/upload-status';
import { useFileUpload } from '@/features/transaction-import/hooks';

export const UploadStep = () => {
    const { setCurrentStep, setImportId, connectedBankAccountId } = useImportModal();

    const [isProcessing, setIsProcessing] = useState(false);

    const { data: banksData } = useConnectedBankEndpoints.getAll({});
    const { mutate: createImport } = useImportFileEndpoints.create({
        onSuccess: (data) => {
            setImportId(data.id);
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

        setIsProcessing(true);
        // You can process multiple files or just take the first one
        const firstFile = completedFiles[0];

        // Create import record with the uploaded file
        // You'll need to modify your API to handle S3 keys
        createImport({
            json: {
                importId: 'temp-import-id', // This should come from somewhere else
                fileName: firstFile.file.name,
                fileUrl: firstFile.uploadUrl || '',
                fileType: firstFile.file.type,
                fileSize: firstFile.file.size,
                storageType: 's3' as const,
                key: firstFile.s3Key,
                // Add other relevant data
            },
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
                onBack={() => setCurrentStep('accountSelection')}
                onContinue={handleContinue}
            />

            <UploadStatus filesCount={files.length} hasErrors={hasErrors} />
        </div>
    );
};
