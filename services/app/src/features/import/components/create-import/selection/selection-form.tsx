import {
    Form,
    FormCombobox,
    FormDropzone,
    FormSubmit,
    useForm
} from '@/components/form';
import { BankAccountSelect } from '@/features/connectedBank/components/account-select';
import { CreateImportSelectionSchema } from '@/features/import/schema/create-import';
import { storeCreateImportData } from '@/features/import/store/create-import-data';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';
import { useEffect } from 'react';
import { z } from 'zod';

import { CreateImportFileDropzone } from './file-dropzone';

/**
 * Form to select bank account and select files for a new import.
 */
export const CreateImportSelectionForm = () => {
    const form = useForm(CreateImportSelectionSchema);
    const { reset: resetForm } = form;

    const { handleStep } = storeCreateImportModal();
    const { setImportData } = storeCreateImportData();

    // reset form on mount
    useEffect(() => {
        resetForm();
    }, [resetForm]);

    const handleSubmit = (
        values: z.infer<typeof CreateImportSelectionSchema>
    ) => {
        // add accountId and files to store
        setImportData(values);
        // reset form
        resetForm();
        // go to next step
        handleStep('uploading');
    };

    return (
        <Form form={form} onSubmit={handleSubmit} className="space-y-4">
            <BankAccountSelect form={form} name="accountId" />
            <CreateImportFileDropzone form={form} />
            <FormSubmit form={form} className="w-full">
                Continue
            </FormSubmit>
        </Form>
    );
};
