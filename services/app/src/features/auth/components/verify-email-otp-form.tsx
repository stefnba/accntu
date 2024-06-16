'use client';

import { Form, FormInputOTP, FormSubmit, useForm } from '@/components/form';
import { useVerifyEmailOTP } from '@/features/auth/api/verify-email-otp';
import { VerifyOTPSchema } from '@/features/auth/schema/otp';
import { z } from 'zod';

export default function VerifyEmailOTPForm() {
    const form = useForm(VerifyOTPSchema, {
        defaultValues: {
            code: ''
        }
    });

    const { mutate } = useVerifyEmailOTP(form);

    const handleSubmit = (values: z.infer<typeof VerifyOTPSchema>) => {
        mutate(values);
    };

    return (
        <Form form={form} onSubmit={handleSubmit}>
            <FormInputOTP
                description="Enter the code thas been sent to your Email."
                name="code"
                form={form}
            />
            <FormSubmit className="mt-6" form={form} />
        </Form>
    );
}
