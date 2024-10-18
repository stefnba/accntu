import { errorToast, successToast } from '@/components/toast';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.transactions[':transactionId'].tag.$post;

export const useAddTagToTransaction = ({
    transactionId
}: {
    transactionId: string;
}) => {
    const queryClient = useQueryClient();

    const q = useMutation<
        InferResponseType<typeof query>,
        Error,
        InferRequestType<typeof query>['param'] &
            InferRequestType<typeof query>['json']
    >({
        mutationFn: async ({ transactionId, name, tagId }) => {
            const response = await query({
                param: {
                    transactionId
                },
                json: {
                    name,
                    tagId
                }
            });

            if (!response.ok) throw new Error(response.statusText);

            return response.json();
        },
        onSuccess: () => {
            successToast('Tag added');

            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['tags'] });
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
