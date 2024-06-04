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
    const { uploadedFiles } = storeUploadImportFiles();

    const files = importData?.files;

    useEffect(() => {
        if (importData) {
            // create new import importData
            mutate({ accountId: importData.accountId });
        }
    }, [mutate, importData]);
    useEffect(() => {
        if (files?.length === uploadedFiles.length) {
            handleStep('preview');
        }
    }, [uploadedFiles, files, handleStep]);

    if (isPending) {
        return <div>Creating Import...</div>;
    }

    if (!importId) {
        return <div>No data</div>;
    }

    return (
        <div>
            {files?.map((f) => (
                <UploadFileCard key={f.path} importId={importId} file={f} />
            ))}
        </div>
    );
};
