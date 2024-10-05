import { errorToast, successToast } from '@/components/toast';
import { storeViewImportSheet } from '@/features/import/store/view-import-sheet';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.import[':id'].$delete;

export const useDeleteImport = () => {
    const queryClient = useQueryClient();
    const { handleClose } = storeViewImportSheet();

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
            queryClient.invalidateQueries({ queryKey: ['imports'] });
            successToast(`Import deleted`);
            handleClose();
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
