'use client';

import { useRouter } from 'next/navigation';

import { VerifyTokenSchema, verifyToken } from '@/auth/actions/mail';
import { Form, FormInputOTP, FormSubmit, useForm } from '@/components/form';
import { useMutation } from '@/lib/hooks/actions';

export default function VerifyEmailForm() {
    const router = useRouter();

    const form = useForm(VerifyTokenSchema, {
        defaultValues: {
            code: ''
        }
    });

    const { execute } = useMutation(verifyToken, {
        onSuccess: ({ redirectUrl }) => {
            router.push(redirectUrl);
        },
        onError(error) {
            if (error.type === 'SERVER') {
                form.setError('code', { message: error.error });
            }
        }
    });

    return (
        <Form form={form} onSubmit={execute}>
            <FormInputOTP
                description="Enter your one-time code thas been sent to your email."
                name="code"
                form={form}
            />
            <FormSubmit className="mt-6" form={form} />
        </Form>
    );
}
