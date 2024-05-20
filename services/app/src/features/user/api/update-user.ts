import { errorToast, successToast } from '@/components/toast';
import { storeUpdateUserNameCollapsible } from '@/features/user/store/update-user-name-collapsible';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.user.update.$patch;

export const useUpdateUser = (section: 'name' | 'apparence') => {
    const { handleClose: handleUserNameCollapsibleClose } =
        storeUpdateUserNameCollapsible();
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
            if (section === 'name') {
                successToast('Your name has been updated');
                handleUserNameCollapsibleClose();
            }

            if (section === 'apparence') {
                successToast('Theme has been updated');
            }

            // queryClient.invalidateQueries({ queryKey: ['labels'] });
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
