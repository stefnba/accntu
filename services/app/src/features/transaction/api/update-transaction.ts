import { errorToast, successToast } from '@/components/toast';
import { storeBulkUpdateTransactionSheet } from '@/features/transaction/store/bulk-update-transaction-sheet';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.transactions[':transactionId'].update.$patch;

export const useUpdateTransaction = ({
    transactionId
}: {
    transactionId: string;
}) => {
    const queryClient = useQueryClient();

    const q = useMutation<
        InferResponseType<typeof query>,
        Error,
        InferRequestType<typeof query>['json']
    >({
        mutationFn: async (values) => {
            const response = await query({
                json: values,
                param: {
                    transactionId
                }
            });

            if (!response.ok) throw new Error(response.statusText);

            return response.json();
        },
        onSuccess: () => {
            successToast('Transaction updated');

            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({
                queryKey: ['transaction', transactionId]
            });
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
