'use client';

import { useRouter } from 'next/navigation';

import {
    VerifyTokenSchema,
    verifyToken
} from '@/actions/auth/login/email/verify';
import { Form, FormInputOTP, FormSubmit, useForm } from '@/components/form';
import { useMutation } from '@/hooks/mutation';
import { use } from 'react';

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
            <FormInputOTP name="code" form={form} />
            <FormSubmit className="mt-6" form={form} />
        </Form>
    );
}
