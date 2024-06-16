import { errorToast, successToast } from '@/components/toast';
import { client } from '@/lib/api/client';
import { useMutation } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

const query = client.api.auth.email.resend.$post;

export const useResendEmailOTP = () => {
    const q = useMutation<InferResponseType<typeof query>, Error, void>({
        mutationFn: async () => {
            const response = await query();

            if (!response.ok) {
                throw new Error('Failed to request email OTP');
            }

            return response.json();
        },
        onSuccess: () => {
            successToast('A new code has been sent to your Email');
        },
        onError: (error) => {
            errorToast(error.message);
        }
    });

    return q;
};
