import { useRouter } from 'next/navigation';

import { errorToast } from '@/components/toast';
import { client } from '@/lib/api/client';
import { useMutation } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.auth.logout.$post;

export const useLogout = () => {
    const router = useRouter();
    const q = useMutation<InferResponseType<typeof query>, Error, void>({
        mutationFn: async (values) => {
            const response = await query({
                json: values
            });

            if (!response.ok) throw new Error('Failed to logout');

            return response.json();
        },
        onSuccess: () => {
            router.push('/login');
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
