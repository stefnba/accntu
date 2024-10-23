import { errorToast, successToast } from '@/components/toast';
import { storeViewUpdateTagSheet } from '@/features/tag/store/crud-tag-sheet';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.tags.create.$post;

export const useCreateTag = () => {
    const { handleClose } = storeViewUpdateTagSheet();
    const queryClient = useQueryClient();

    const q = useMutation<
        InferResponseType<typeof query, 201>,
        Error,
        InferRequestType<typeof query>['json']
    >({
        mutationFn: async (values) => {
            const res = await query({
                json: values
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }

            return res.json();
        },
        onSuccess: (data) => {
            const a = data.id;
            successToast('Tag has been created');
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            handleClose();
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
