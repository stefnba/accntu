import { errorToast, successToast } from '@/components/toast';
import { storeViewUpdateLabelSheet } from '@/features/label/store/view-update-label-sheet';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.labels[':id'].$delete;

export const useDeleteLabel = () => {
    const { handleClose } = storeViewUpdateLabelSheet();
    const queryClient = useQueryClient();

    const q = useMutation<
        InferResponseType<typeof query>,
        Error,
        InferRequestType<typeof query>['param']
    >({
        mutationFn: async (param) => {
            const response = await query({
                param
            });

            if (!response.ok) throw new Error(response.statusText);

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labels'] });
            successToast('Label has been deleted');
            handleClose();
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
