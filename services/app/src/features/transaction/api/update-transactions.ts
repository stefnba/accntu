import { errorToast, successToast } from '@/components/toast';
import { storeBulkUpdateTransactionSheet } from '@/features/transaction/store/bulk-update-transaction-sheet';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.transactions['$patch'];

export const useUpdateTransactions = () => {
    const queryClient = useQueryClient();

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
        onSuccess: () => {
            successToast('Transactions updated');

            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
