import { errorToast, successToast } from '@/components/toast';
import { storeCreateConnectedBankModal } from '@/features/connectedBank/store/create-bank-modal';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.connected.banks.create.$post;

export const useCreateConnectedBank = () => {
    const { handleClose } = storeCreateConnectedBankModal();
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
            queryClient.invalidateQueries({ queryKey: ['connected-banks'] });
            successToast('Account has been created');
            handleClose();
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
