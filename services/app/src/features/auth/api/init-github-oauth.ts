import { useRouter } from 'next/navigation';

import { errorToast } from '@/components/toast';
import { client } from '@/lib/api/client';
import { EMAIL_OTP_REDIRECT_URL } from '@/lib/auth/routes';
import { useMutation } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.auth.oauth.github.init.$get;

export const useInitGitHubOauth = () => {
    const router = useRouter();
    const q = useMutation<InferResponseType<typeof query>, Error, void>({
        mutationFn: async (values) => {
            const response = await query({
                json: values
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            return response.json();
        },
        onSuccess: (data) => {
            router.push(data.url);
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
