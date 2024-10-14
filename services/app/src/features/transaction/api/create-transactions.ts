import { errorToast, successToast } from '@/components/toast';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';
import { storeImportTransactions } from '@/features/import/store/import-transactions';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.transactions.create['$post'];

export const useCreateTransactions = () => {
    const queryClient = useQueryClient();
    const { handleStep } = storeCreateImportModal();
    const { updateCount } = storeImportTransactions();

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
        onSuccess: ({ allImported, transactions, importId }) => {
            console.log(allImported);

            if (allImported) {
                // successToast('All transactions imported');
                handleStep('success');
            } else {
                successToast(`${transactions.length} Transactions created`);
            }

            // update store with number of transactions successfully imported
            updateCount(transactions.length);

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
