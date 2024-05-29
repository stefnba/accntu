import {
    Form,
    FormCombobox,
    FormDropzone,
    FormSubmit,
    useForm
} from '@/components/form';
import { BankAccountSelect } from '@/features/connectedBank/components/account-select';
import { CreateImportSelectionSchema } from '@/features/import/schema/create-import';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';
import { storeUploadImportFiles } from '@/features/import/store/upload-import-files';
import { z } from 'zod';

import { CreateImportFileDropzone } from './file-dropzone';

export const CreateImportSelectionForm = () => {
    const form = useForm(CreateImportSelectionSchema);
    const setData = storeUploadImportFiles((state) => state.setData);

    const { handleStep } = storeCreateImportModal();

    const handleSubmit = (
        values: z.infer<typeof CreateImportSelectionSchema>
    ) => {
        // add to store
        setData(values);
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
