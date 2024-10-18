import { errorToast, successToast } from '@/components/toast';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.tags[':tagId'][':transactionId'].$delete;

export const useRemoveTagFromTransaction = ({
    transactionId
}: {
    transactionId: string;
}) => {
    const queryClient = useQueryClient();

    const q = useMutation<
        InferResponseType<typeof query>,
        Error,
        InferRequestType<typeof query>['param']
    >({
        mutationFn: async ({ tagId, transactionId }) => {
            const response = await query({
                param: {
                    tagId,
                    transactionId
                }
            });

            if (!response.ok) throw new Error(response.statusText);

            return response.json();
        },
        onSuccess: () => {
            successToast('Tag revmoved');

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
