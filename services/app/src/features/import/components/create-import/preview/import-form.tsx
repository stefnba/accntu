import { Form, FormSubmit, useForm } from '@/components/form';
import { usePreviewTransactions } from '@/features/import/api/preview-transactions';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';
import { storePreviewImportFiles } from '@/features/import/store/preview-import-files';
import { useCreateTransactions } from '@/features/transaction/api/create-transactions';
import { CreateTransactionsSchema } from '@/features/transaction/schema/create-transactions';
import { useEffect, useMemo } from 'react';
import { LuSave } from 'react-icons/lu';
import { z } from 'zod';

interface Props {}

export const ImportForm: React.FC<Props> = ({}) => {
    const form = useForm(CreateTransactionsSchema);
    const { mutate } = useCreateTransactions();

    const { importId } = storeCreateImportModal();
    const { fileId } = storePreviewImportFiles();

    const { data } = usePreviewTransactions({
        id: importId,
        fileId
    });

    const newTransactions = useMemo(
        () => data?.filter((t) => !t.isDuplicate),
        [data]
    );

    useEffect(() => {
        if (newTransactions && importId) {
            form.setValue('values', newTransactions, { shouldValidate: true });
            form.setValue('importId', importId, { shouldValidate: true });
            form.setValue('accountId', 'twbhdpp6rwkz6w2brc2r8y22', {
                shouldValidate: true
            }); // todo replace with actual account id
        }
    }, [newTransactions, form, importId]);

    const handleSubmit = (values: z.infer<typeof CreateTransactionsSchema>) => {
        // todo create transactions
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
