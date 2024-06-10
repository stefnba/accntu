import { Form, FormSubmit, useForm } from '@/components/form';
import { usePreviewTransactions } from '@/features/import/api/preview-transactions';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';
import { storePreviewImportFiles } from '@/features/import/store/preview-import-files';
import { storeUploadImportFiles } from '@/features/import/store/upload-import-files';
import { useCreateTransactions } from '@/features/transaction/api/create-transactions';
import { CreateTransactionsSchema } from '@/features/transaction/schema/create-transactions';
import { useEffect, useMemo } from 'react';
import { LuSave } from 'react-icons/lu';
import { z } from 'zod';

interface Props {}

export const ImportForm: React.FC<Props> = ({}) => {
    const form = useForm(CreateTransactionsSchema);
    const { mutate } = useCreateTransactions();

    const { importId, importData } = storeCreateImportModal();
    const { fileId } = storePreviewImportFiles();
    const { accountId } = importData || {};

    const { data } = usePreviewTransactions({
        id: importId,
        fileId
    });

    const newTransactions = useMemo(
        () => data?.filter((t) => !t.isDuplicate),
        [data]
    );

    useEffect(() => {
        console.log('newTransactions', fileId, accountId);
        if (newTransactions && fileId && accountId) {
            form.setValue('values', newTransactions, { shouldValidate: true });
            form.setValue('importFileId', fileId, { shouldValidate: true });
            form.setValue('accountId', accountId, {
                shouldValidate: true
            });
        }
    }, [newTransactions, form, fileId, accountId]);

    const handleSubmit = (values: z.infer<typeof CreateTransactionsSchema>) => {
        // create transactions
        mutate(values);
    };

    return (
        <Form form={form} onSubmit={handleSubmit}>
            <FormSubmit className="mt-0" form={form}>
                <LuSave className="size-4 mr-2" /> Import{' '}
                {newTransactions?.length} Transactions
            </FormSubmit>
        </Form>
    );
};
