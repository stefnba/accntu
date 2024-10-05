import { errorToast, successToast } from '@/components/toast';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.import.file[':id'].delete.$delete;

export const useDeleteImportFile = () => {
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
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [] });
            successToast(`File '${data.filename}' has been deleted`);
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
