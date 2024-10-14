import { Form, FormSubmit, useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { useDeleteImport } from '@/features/import/api/delete-import';
import { useDeleteImportFile } from '@/features/import/api/delete-import-file';
import { usePreviewTransactions } from '@/features/import/api/preview-transactions';
import { storeCreateImportData } from '@/features/import/store/create-import-data';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';
import { storePreviewImportFiles } from '@/features/import/store/preview-import-files';
import { useCreateTransactions } from '@/features/transaction/api/create-transactions';
import { CreateTransactionsSchema } from '@/features/transaction/schema/create-transactions';
import { useEffect, useMemo } from 'react';
import { LuSave } from 'react-icons/lu';
import { z } from 'zod';

import { CreateImportPreviewFiles } from './preview-files';
import { CreateImportPreviewTable } from './preview-table';

interface Props {}

export const CreateImportPreview: React.FC<Props> = ({}) => {
    const form = useForm(CreateTransactionsSchema);
    const { mutate: mutateCreateTransactions } = useCreateTransactions();
    const { mutate: mutateDeleteImportFile } = useDeleteImportFile();
    const { mutate: mutateDeleteImport } = useDeleteImport();

    const { importId, importData } = storeCreateImportData();
    const { handleStep } = storeCreateImportModal();
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

    const duplicateTransactions = useMemo(
        () => data?.filter((t) => t.isDuplicate),
        [data]
    );

    useEffect(() => {
        if (newTransactions && fileId && accountId) {
            form.setValue('values', newTransactions, { shouldValidate: true });
            form.setValue('importFileId', fileId, { shouldValidate: true });
            form.setValue('accountId', accountId, {
                shouldValidate: true
            });
        }
    }, [newTransactions, form, fileId, accountId]);

    // create transactions
    const handleSubmit = (values: z.infer<typeof CreateTransactionsSchema>) => {
        mutateCreateTransactions(values);
    };

    // delete one import file record
    const handleFileDelete = (fileId: string) => {
        mutateDeleteImportFile({ id: fileId });
    };

    // delete import record
    const handleImportDelete = () => {
        mutateDeleteImport({ id: importId! });
    };

    // upload additional files
    const handleUploadFiles = () => {
        handleStep('selection');
    };

    if (importData?.files?.length === 0)
        return (
            <div>
                <div>No files are assigned to this Import.</div>
                <div className="flex mt-4 space-x-2">
                    <Button onClick={() => handleUploadFiles()}>
                        Upload Files
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => handleImportDelete()}
                    >
                        Delete Import
                    </Button>
                </div>
            </div>
        );

    return (
        <div className="w-[1200px]">
            <div className="flex space-x-4">
                <CreateImportPreviewFiles />
                {/* <ImportForm /> */}
                <Form form={form} onSubmit={handleSubmit}>
                    {fileId && (
                        <div className="flex space-x-2">
                            <FormSubmit className="mt-0" form={form}>
                                <LuSave className="size-4 mr-2" /> Import
                            </FormSubmit>
                            <Button
                                variant="outline"
                                onClick={() => handleFileDelete(fileId)}
                            >
                                Delete File
                            </Button>
                        </div>
                    )}
                </Form>
            </div>
            {(newTransactions?.length ||
                0 > 0 ||
                duplicateTransactions?.length ||
                0 > 0) && (
                <div className="text-sm my-4 text-gray-500">
                    {newTransactions?.length} new transactions will be imported.{' '}
                    {duplicateTransactions?.length} duplicate will be skipped.
                </div>
            )}
            <CreateImportPreviewTable />
        </div>
    );
};
