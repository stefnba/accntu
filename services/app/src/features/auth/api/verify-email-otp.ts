import { useRouter } from 'next/navigation';

import { errorToast } from '@/components/toast';
import { client } from '@/lib/api/client';
import { useMutation } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.auth.email.verify.$post;

export const useVerifyEmailOTP = (form: any) => {
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

            if (response.status === 401) {
                const { error } = await response.json();
                throw new Error(error);
            }

            return response.json();
        },
        onSuccess: () => {
            router.push('/');
        },
        onError: (error) => {
            form.reset();
            errorToast(error.message);
        }
    });

    return q;
};
