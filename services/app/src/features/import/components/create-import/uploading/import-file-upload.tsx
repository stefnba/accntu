import { Button } from '@/components/ui/button';
import { useCreateImport } from '@/features/import/api/create-import';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';
import { storeUploadImportFiles } from '@/features/import/store/upload-import-files';
import { useEffect } from 'react';

import { UploadFileCard } from './upload-file-card';

/**
 * Component to create a new import record and then upload all selected files.
 */
export const ImportFileUpload = () => {
    const { mutate, isPending } = useCreateImport();

    const { importId, handleStep, importData } = storeCreateImportModal();
    const { uploadedFiles, resetUploadedFiles } = storeUploadImportFiles();

    const files = importData?.files;

    useEffect(() => {
        resetUploadedFiles();
    }, [resetUploadedFiles]);

    // create new import record
    useEffect(() => {
        if (importData) {
            // create new import importData
            mutate({ accountId: importData.accountId });
        }
    }, [mutate, importData]);

    useEffect(() => {
        if (files?.length === uploadedFiles.length) {
            // handleStep('preview');
        }
    }, [uploadedFiles, files, handleStep]);

    if (isPending) {
        return <div>Creating Import...</div>;
    }

    if (!importId) {
        return <div>No data</div>;
    }

    const filesCount = files?.length || 0;
    const uploadedFilesCount = uploadedFiles.length;

    const allFilesUploaded = filesCount === uploadedFilesCount;

    return (
        <div>
            <div className="gap-y-2 grid">
                {files?.map((f) => (
                    <UploadFileCard key={f.path} importId={importId} file={f} />
                ))}
            </div>

            {!allFilesUploaded ? (
                <div className="mt-4 text-sm text-muted-foreground ml-auto mr-0">
                    {uploadedFilesCount} of {filesCount} file(s) uploaded
                </div>
            ) : (
                <Button
                    className="w-full mt-8"
                    disabled={!allFilesUploaded}
                    onClick={() => handleStep('preview')}
                >
                    Continue
                </Button>
            )}
        </div>
    );
};
