import { errorToast, successToast } from '@/components/toast';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.transactions.create['$post'];

export const useCreateTransactions = () => {
    const queryClient = useQueryClient();
    const { handleStep, importId } = storeCreateImportModal();

    const q = useMutation<
        InferResponseType<typeof query>,
        Error,
        InferRequestType<typeof query>['json']
    >({
        mutationFn: async (values) => {
            const response = await query({
                json: values
            });

            if (!response.ok) throw new Error(response.statusText);

            return response.json();
        },
        onSuccess: ({ allImported, transactions }) => {
            if (allImported) {
                // successToast('All transactions imported');
                handleStep('success');
            } else {
                successToast(`${transactions.length} Transactions created`);
            }

            queryClient.invalidateQueries({ queryKey: ['imports'] });
            queryClient.invalidateQueries({
                queryKey: [
                    'import',
                    {
                        id: importId
                    }
                ]
            });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
