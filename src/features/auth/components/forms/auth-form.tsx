'use client';

import { Form, FormInput, FormSubmitButton, useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { loginEmailFormSchema, signupEmailFormSchema } from '@/features/auth/schemas';
import { TSocialProvider, useSignIn } from '@/lib/auth/client';
import { cn } from '@/lib/utils';

/*
    Social Auth
*/
const SocialAuth = ({ action }: { action: 'Login' | 'Sign up' }) => {
    const { signInSocial, isSigningIn } = useSignIn();

    const handleSocialLogin = async (provider: TSocialProvider) => {
        signInSocial(provider);
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Google */}
            {/* <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin('google')}
                disabled={isSigningIn}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                    />
                </svg>
                {`${action} with Google`}
            </Button> */}
            {/* GitHub */}
            <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin('github')}
                disabled={isSigningIn}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
                        fill="currentColor"
                    />
                </svg>
                {`${action} with GitHub`}
            </Button>
        </div>
    );
};

/*
    Email Auth
*/
const EmailAuth = ({ action }: { action: 'Login' | 'Sign up' }) => {
    const { initiateEmailOTP, isSigningIn, signingInMethod } = useSignIn();

    const isLogin = action === 'Login';

    // Login form
    const LoginFormComponent = () => {
        const form = useForm({
            schema: loginEmailFormSchema,
            defaultValues: {
                email: '',
            },
            onSubmit: (data) => {
                try {
                    initiateEmailOTP(data.email);
                } catch (error) {
                    console.log('Login failed:', error);
                }
            },
            onError: (errors) => {
                console.log('Form errors:', errors);
            },
        });

        return (
            <div className="flex flex-col gap-6">
                <Form form={form} className="grid gap-4">
                    <FormInput
                        placeholder="Enter your Email"
                        name="email"
                        form={form}
                        disabled={isSigningIn}
                    />
                    <FormSubmitButton
                        disabledBeforeValid={isSigningIn}
                        form={form}
                        className="w-full"
                    >
                        {isSigningIn && signingInMethod == 'email-otp' ? `${action}...` : action}
                    </FormSubmitButton>
                    {form.submitError && (
                        <p className="text-sm text-red-500">{form.submitError.message}</p>
                    )}
                </Form>
            </div>
        );
    };

    // Sign up form
    const SignUpFormComponent = () => {
        const form = useForm({
            schema: signupEmailFormSchema,
            defaultValues: {
                name: '',
                email: '',
            },
            onSubmit: async (data) => {
                try {
                    // Implement sign up logic here
                    console.log('Sign up data:', data);
                } catch (error) {
                    console.log('Sign up failed:', error);
                }
            },
            onError: (errors) => {
                console.log('Form errors:', errors);
            },
        });

        return (
            <div className="flex flex-col gap-6">
                <Form form={form} className="grid gap-4">
                    <FormInput placeholder="Enter your Name" name="name" form={form} />
                    <FormInput placeholder="Enter your Email" name="email" form={form} />
                    <FormSubmitButton disabledBeforeValid={false} form={form} className="w-full">
                        {isSigningIn ? `${action}...` : action}
                    </FormSubmitButton>
                    {form.submitError && (
                        <p className="text-sm text-red-500">{form.submitError.message}</p>
                    )}
                </Form>
            </div>
        );
    };

    return isLogin ? <LoginFormComponent /> : <SignUpFormComponent />;
};

type AuthFormProps = React.ComponentProps<'div'> & {
    mode: 'login' | 'signup';
};

export function AuthForm({ className, mode, ...props }: AuthFormProps) {
    const isLogin = mode === 'login';
    const action = isLogin ? 'Login' : 'Sign up';
    const toggleText = isLogin ? "Don't have an account?" : 'Already have an account?';
    const toggleLink = isLogin ? 'Sign up' : 'Sign in';
    const toggleHref = isLogin ? '/auth/signup' : '/auth/login';

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card className="mx-auto w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">{action}</CardTitle>
                    <CardDescription>
                        {isLogin && <>Enter your email below to login to your account</>}
                        {!isLogin && <>Enter your information to create an account</>}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col gap-6">
                        <SocialAuth action={action} />
                        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                            <span className="relative z-10 bg-background px-2 text-muted-foreground text-sm">
                                {action === 'Login' && <>Or continue with your Email</>}
                                {action === 'Sign up' && <>Or continue with your Name and Email</>}
                            </span>
                        </div>
                        <EmailAuth action={action} />

                        <div className="text-center text-sm">
                            {toggleText}{' '}
                            <a href={toggleHref} className="underline underline-offset-4">
                                {toggleLink}
                            </a>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                By clicking {action.toLowerCase()}, you agree to our{' '}
                <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    );
}
