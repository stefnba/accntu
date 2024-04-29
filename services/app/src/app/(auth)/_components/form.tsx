'use client';

import { useRouter } from 'next/navigation';

import { Form, FormInput, useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { SendTokenSchema, sendToken } from '@/lib/auth/actions/mail';
import { useMutation } from '@/lib/hooks/actions';

import OAuthProviders from './oauth-provider';

interface Props {
    type: 'login' | 'register';
}

/**
 * Login Form.
 * Also used for as Register Form.
 */
const LoginForm: React.FC<Props> = ({ type = 'login' }) => {
    const router = useRouter();

    const form = useForm(SendTokenSchema, {
        defaultValues: {
            email: 'stefan@com.com'
        },
        reValidateMode: 'onBlur',
        mode: 'onBlur'
    });

    const { execute } = useMutation(sendToken, {
        onSuccess: ({ redirectUrl }) => {
            router.push(redirectUrl);
        },
        onError(error) {
            console.error(error);
        }
    });

    return (
        <div className="mt-6">
            <Form form={form} onSubmit={execute}>
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

export default LoginForm;
