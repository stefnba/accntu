import { errorToast, successToast } from '@/components/toast';
import { storeUpdateConnectedBankSheet } from '@/features/connectedBank/store/update-bank-sheet';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.connected.banks[':id'].$delete;

export const useDeleteConnectedBank = () => {
    const { handleClose } = storeUpdateConnectedBankSheet();
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
            queryClient.invalidateQueries({ queryKey: ['connected-banks'] });
            successToast('Account has been deleted');
            handleClose();
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
