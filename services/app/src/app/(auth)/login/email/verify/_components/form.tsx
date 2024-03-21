'use client';

import { useRouter } from 'next/navigation';

import { VerifyTokenSchema, verifyToken } from '@/auth/actions/mail';
import { Form, FormInputOTP, FormSubmit, useForm } from '@/components/form';
import { useMutation } from '@/hooks/mutation';

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
            form.setError('code', { message: error.message });
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
