import { errorToast, successToast } from '@/components/toast';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.import.create['$post'];

export const useCreateImport = () => {
    const { setImportId } = storeCreateImportModal();

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
        onSuccess: ({ id }) => {
            setImportId(id);
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
