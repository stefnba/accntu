'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { storeCreateImportData } from '@/features/import/store/create-import-data';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';
import { storeUploadImportFiles } from '@/features/import/store/upload-import-files';
import { useEffect } from 'react';

import { ImportSuccess } from './importing/success';
import { CreateImportPreview } from './preview/preview';
import { CreateImportSelectionForm } from './selection/selection-form';
import { ImportFileUpload } from './uploading/import-file-upload';

interface Props {}

/**
 * Modal for creating a new import.
 */
export const CreateImportModal: React.FC<Props> = ({}) => {
    const { isOpen, handleClose, step } = storeCreateImportModal();
    const { importData, importId } = storeCreateImportData();

    console.log('importData', importData);
    console.log('importId', importId);

    return (
        <ResponsiveModal open={isOpen} onOpenChange={handleClose}>
            {/* <DialogContent className="max-w-fit">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        New Import
                    </DialogTitle>
                </DialogHeader> */}

            {/* Steps */}
            <div className="min-w-[450px]">
                {step === 'selection' && <CreateImportSelectionForm />}
                {step === 'uploading' && <ImportFileUpload />}
                {step === 'success' && <ImportSuccess />}
            </div>
            {step === 'preview' && <CreateImportPreview />}
        </ResponsiveModal>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-fit">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        New Import
                    </DialogTitle>
                </DialogHeader>

                {/* Steps */}
                <div className="min-w-[450px]">
                    {step === 'selection' && <CreateImportSelectionForm />}
                    {step === 'uploading' && <ImportFileUpload />}
                    {step === 'success' && <ImportSuccess />}
                </div>
                {step === 'preview' && <CreateImportPreview />}
            </DialogContent>
        </Dialog>
    );
};
