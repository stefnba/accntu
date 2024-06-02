import { useRouter } from 'next/navigation';

import { errorToast } from '@/components/toast';
import { client } from '@/lib/api/client';
import { EMAIL_OTP_REDIRECT_URL } from '@/lib/auth/routes';
import { useMutation } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.auth.email.request.$post;

export const useRequestEmailOTP = () => {
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

            if (response.status === 400) {
                const { error } = await response.json();
                throw new Error(error);
            }

            return response.json();
        },
        onSuccess: () => {
            router.push(EMAIL_OTP_REDIRECT_URL);
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
