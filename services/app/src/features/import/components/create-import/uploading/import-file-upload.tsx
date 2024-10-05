import { Button } from '@/components/ui/button';
import { useCreateImport } from '@/features/import/api/create-import';
import { storeCreateImportData } from '@/features/import/store/create-import-data';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';
import { storeUploadImportFiles } from '@/features/import/store/upload-import-files';
import { useEffect, useRef } from 'react';

import { UploadFileCard } from './upload-file-card';

/**
 * Component to create a new import record and then upload all selected files.
 */
export const ImportFileUpload = () => {
    const hasFired = useRef(false);
    const { mutate: mutateCreateImport, isPending } = useCreateImport();

    const { handleStep } = storeCreateImportModal();
    const { importId, importData, setImportId } = storeCreateImportData();
    const { uploadedFiles } = storeUploadImportFiles();

    const files = importData?.files;

    useEffect(() => {
        // create new import record, and update store with importId
        if (!hasFired.current && importData) {
            hasFired.current = true;
            mutateCreateImport({ accountId: importData.accountId });
        }
    }, [mutateCreateImport, importData, setImportId]);

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
                {files?.map((f) => <UploadFileCard key={f.path} file={f} />)}
            </div>

            <div className="text-sm text-muted-foreground mt-4">
                {uploadedFilesCount} of {filesCount} file
                {filesCount > 1 ? 's' : null} uploaded
            </div>

            <Button
                className="w-full mt-4"
                disabled={!allFilesUploaded}
                onClick={() => handleStep('preview')}
            >
                Continue
            </Button>
        </div>
    );
};
