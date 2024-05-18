import { errorToast, successToast } from '@/components/toast';
import { storeViewUpdateLabelSheet } from '@/features/label/store/view-update-label-sheet';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.labels[':id'].$patch;

export const useUpdateLabel = () => {
    const { handleClose } = storeViewUpdateLabelSheet();
    const queryClient = useQueryClient();

    const q = useMutation<
        InferResponseType<typeof query>,
        Error,
        { id: string; values: InferRequestType<typeof query>['json'] }
    >({
        mutationFn: async ({ values, id }) => {
            const response = await query({
                json: values,
                param: { id }
            });

            if (!response.ok) throw new Error(response.statusText);

            return response.json();
        },
        onSuccess: () => {
            successToast('Label has been updated');
            queryClient.invalidateQueries({ queryKey: ['labels'] });
            handleClose();
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
