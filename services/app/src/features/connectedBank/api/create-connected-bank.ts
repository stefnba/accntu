import { errorToast } from '@/components/toast';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.connected.banks.create.$post;

export const useCreateConnectedBank = () => {
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
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
