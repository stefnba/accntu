'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';

import { CreateImportPreview } from './preview/preview';
import { CreateImportSelectionForm } from './selection/selection-form';
import { ImportFileUpload } from './uploading/import-file-upload';

interface Props {}

/**
 * Modal for creating a new import.
 */
export const CreateImportModal: React.FC<Props> = ({}) => {
    const { isOpen, handleClose, step } = storeCreateImportModal();

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-fit">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        New Import
                    </DialogTitle>
                </DialogHeader>

                {/* Steps */}
                {step === 'selection' && <CreateImportSelectionForm />}
                {step === 'uploading' && <ImportFileUpload />}
                {step === 'preview' && <CreateImportPreview />}
            </DialogContent>
        </Dialog>
    );
};
