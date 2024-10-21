import { errorToast, successToast } from '@/components/toast';
import { storeViewUpdateTagSheet } from '@/features/tag/store/crud-tag-sheet';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.tags[':id'].$delete;

export const useDeleteTag = () => {
    const { handleClose } = storeViewUpdateTagSheet();
    const queryClient = useQueryClient();

    const q = useMutation<
        InferResponseType<typeof query>,
        Error,
        InferRequestType<typeof query>['param']
    >({
        mutationFn: async ({ id }) => {
            const response = await query({
                param: { id }
            });

            if (!response.ok) throw new Error(response.statusText);

            return response.json();
        },
        onSuccess: () => {
            successToast('Tag deleted');
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            handleClose();
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
