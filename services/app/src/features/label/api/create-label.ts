import { errorToast, successToast } from '@/components/toast';
import { storeCreateLabelSheet } from '@/features/label/store/create-label-sheet';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.labels.create.$post;

export const useCreateLabel = () => {
    const { handleClose } = storeCreateLabelSheet();
    const queryClient = useQueryClient();

    const q = useMutation<
        InferResponseType<typeof query>,
        InferResponseType<typeof query, 400>,
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
            successToast('Label has been created');
            queryClient.invalidateQueries({ queryKey: ['labels'] });
            handleClose();
        },
        onError: ({ error }) => {
            errorToast(error);
        }
    });

    return q;
};
