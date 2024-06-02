import { useRouter } from 'next/router';

import { errorToast, successToast } from '@/components/toast';
import { storeCreateLabelSheet } from '@/features/label/store/create-label-sheet';
import { client } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.auth.email.request.$post;

export const useLoginGitHubOauth = () => {
    const router = useRouter();

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
            router.push('/login/email/verify');
        },
        onError: (error) => {
            console.log(error);
            // errorToast(error.message);
        }
    });

    return q;
};
