import { errorToast, successToast } from '@/components/toast';
import { storeCreateImportData } from '@/features/import/store/create-import-data';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.import.create['$post'];

/**
 * Create new import record. If action is successful, importId store is updated.
 */
export const useCreateImport = () => {
    const { setImportId } = storeCreateImportData();
    const queryClient = useQueryClient();

    const q = useMutation<
        InferResponseType<typeof query, 201>,
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
            queryClient.invalidateQueries({ queryKey: ['imports'] });
            setImportId(id);
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
