'use client';

import { useRouter } from 'next/navigation';

import { Form, FormInput, useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { useRequestEmailOTP } from '@/features/auth/api/request-email-otp';
import { SendOTPSchema } from '@/features/auth/schema/otp';
import { z } from 'zod';

import { OAuthProviders } from './oauth-provider';

interface Props {
    type: 'login' | 'register';
}

/**
 * Login and Register Form.
 */
export const LoginRegisterForm: React.FC<Props> = ({ type = 'login' }) => {
    const form = useForm(SendOTPSchema, {
        defaultValues: {
            email: 'stefan@com.com'
        },
        reValidateMode: 'onBlur',
        mode: 'onBlur'
    });

    const { mutate } = useRequestEmailOTP();

    const handleSubmit = (values: z.infer<typeof SendOTPSchema>) => {
        mutate(values);
    };

    return (
        <div className="mt-6">
            <Form form={form} onSubmit={handleSubmit}>
                <div className="mt-6 space-y-4">
                    <FormInput form={form} name="email" type="email" />
                </div>
                <Button type="submit" className="mt-2 w-full" size="lg">
                    {type === 'register'
                        ? 'Register with Email'
                        : 'Login with Email'}
                </Button>
            </Form>
            <OAuthProviders />
        </div>
    );
};
