'use client';

import { useForm } from '@/components/form';
import { useSignInEmailPassword } from '@/lib/auth/client/hooks/sign-in';

import { z } from 'zod';

export function LoginPasswordForm() {
    const signInEmailPassword = useSignInEmailPassword();

    const { Form, Input, SubmitButton } = useForm({
        schema: z.object({
            email: z.email().min(1),
            password: z.string().min(1),
        }),
        defaultValues: {
            email: '',
            password: '',
        },
        onSubmit: (data) => {
            signInEmailPassword.mutate({
                email: data.email,
                password: data.password,
            });
        },
    });
    return (
        <Form className="grid gap-4">
            <Input name="email" label="Email" />
            <Input name="password" label="Password" />
            <SubmitButton>Login</SubmitButton>
        </Form>
    );
}
