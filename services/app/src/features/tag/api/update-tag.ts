import { errorToast, successToast } from '@/components/toast';
import { storeViewUpdateTagSheet } from '@/features/tag/store/crud-tag-sheet';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.tags[':id'].$patch;

export const useUpdateTag = () => {
    const { handleClose } = storeViewUpdateTagSheet();
    const queryClient = useQueryClient();

    const q = useMutation<
        InferResponseType<typeof query, 201>,
        Error,
        InferRequestType<typeof query>['json'] &
            InferRequestType<typeof query>['param']
    >({
        mutationFn: async ({ id, ...values }) => {
            const response = await query({
                json: values,
                param: { id }
            });

            if (!response.ok) throw new Error(response.statusText);

            return response.json();
        },
        onSuccess: (data) => {
            successToast('Tag updated');
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            queryClient.invalidateQueries({
                queryKey: ['tag', { id: data.id }]
            });
            handleClose();
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
