'use client';

import { useConnectedBankEndpoints } from '@/features/bank/api';
import { useImportFileEndpoints } from '@/features/transaction-import/api';
import { useImportModal } from '@/features/transaction-import/hooks';
import { useState } from 'react';

import { FileDropzone } from '@/features/transaction-import/components/import-modal/upload-step/file-dropzone';
import { FileList } from '@/features/transaction-import/components/import-modal/upload-step/file-list';
import { UploadActions } from '@/features/transaction-import/components/import-modal/upload-step/upload-actions';
import { UploadHeader } from '@/features/transaction-import/components/import-modal/upload-step/upload-header';
import { UploadStatus } from '@/features/transaction-import/components/import-modal/upload-step/upload-status';
import { useFileUpload } from '@/features/transaction-import/hooks';

export const UploadStep = () => {
    const { setCurrentStep, setImportId, setFileName, connectedBankAccountId } = useImportModal();

    const [isProcessing, setIsProcessing] = useState(false);

    const { data: banksData } = useConnectedBankEndpoints.getAll({});
    const { mutate: createImport } = useImportFileEndpoints.create({
        onSuccess: (data) => {
            setImportId(data.transactionImport.id);
            setCurrentStep('processing');
        },
        errorHandlers: {
            default({ error }) {
                alert(error.message);
                setIsProcessing(false);
            },
        },
    });

    const { files, dropZoneProps, removeFile, retryUpload, completedFilesCount, hasErrors } =
        useFileUpload();

    const handleContinue = async () => {
        const completedFiles = files.filter((f) => f.status === 'completed');
        if (completedFiles.length === 0) {
            alert('Please upload at least one file');
            return;
        }

        setIsProcessing(true);
        // You can process multiple files or just take the first one
        const firstFile = completedFiles[0];
        setFileName(firstFile.file.name);

        // Create import record with the uploaded file
        // You'll need to modify your API to handle S3 keys
        createImport({
            json: {
                connectedBankAccountId: connectedBankAccountId!,
                fileName: firstFile.file.name,
                s3Key: firstFile.s3Key,
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
            <UploadHeader />

            <FileDropzone {...dropZoneProps} />

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
