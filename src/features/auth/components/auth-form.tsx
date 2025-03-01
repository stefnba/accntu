'use client';

import { GalleryVerticalEnd } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    loginEmailFormSchema,
    signupEmailFormSchema,
    SocialProvider,
} from '@/features/auth/schemas';
import { useAuth } from '@/hooks';
import { useZodForm } from '@/hooks/use-form';
import { cn } from '@/lib/utils';

const SocialAuth = ({ action }: { action: 'Login' | 'Sign up' }) => {
    const { loginWithSocial, isLoading } = useAuth();

    const handleSocialLogin = async (provider: SocialProvider) => {
        await loginWithSocial(provider);
    };

    return (
        <div className="flex flex-col gap-2">
            <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                    />
                </svg>
                {`${action} with Google`}
            </Button>
            <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading}
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

const EmailAuth = ({ action }: { action: 'Login' | 'Sign up' }) => {
    const { loginWithEmail, signupWithEmail, isLoading, authMethod } = useAuth();
    const isLogin = action === 'Login';

    // Login form
    const LoginFormComponent = () => {
        const {
            register,
            handleSubmit,
            formState: { errors },
            isSubmitting,
            submitError,
        } = useZodForm({
            schema: loginEmailFormSchema.schema,
            defaultValues: loginEmailFormSchema.defaultValues,
            onSubmit: async (data) => {
                try {
                    await loginWithEmail(data.email);
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
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        disabled={isLoading}
                        id="email"
                        type="email"
                        placeholder="john@email.com"
                        {...register('email')}
                        aria-invalid={errors.email ? 'true' : 'false'}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
                <Button
                    onClick={() => handleSubmit()}
                    type="button"
                    className="w-full"
                    disabled={isLoading}
                >
                    {authMethod === 'email' ? `${action}...` : action}
                </Button>
                {submitError && <p className="text-sm text-red-500">{submitError.message}</p>}
            </div>
        );
    };

    // Signup form
    const SignupFormComponent = () => {
        const {
            register,
            handleSubmit,
            formState: { errors },
            isSubmitting,
            submitError,
        } = useZodForm({
            ...signupEmailFormSchema,
            onSubmit: async (data) => {
                try {
                    await signupWithEmail(data.email, data.name);
                } catch (error) {
                    console.log('Signup failed:', error);
                }
            },
            onError: (errors) => {
                console.log('Form errors:', errors);
            },
        });

        return (
            <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="John"
                        {...register('name')}
                        aria-invalid={errors.name ? 'true' : 'false'}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="john@email.com"
                        {...register('email')}
                        aria-invalid={errors.email ? 'true' : 'false'}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
                <Button
                    onClick={() => handleSubmit()}
                    type="button"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? `${action}...` : action}
                </Button>
                {submitError && <p className="text-sm text-red-500">{submitError.message}</p>}
            </div>
        );
    };

    // Render the appropriate form based on mode
    return isLogin ? <LoginFormComponent /> : <SignupFormComponent />;
};

type AuthFormProps = React.ComponentPropsWithoutRef<'div'> & {
    mode: 'login' | 'signup';
};

/**
 * AuthForm component
 */
export function AuthForm({ className, mode, ...props }: AuthFormProps) {
    const isLogin = mode === 'login';
    const action = isLogin ? 'Login' : 'Sign up';
    const title = isLogin ? 'Welcome back' : 'Create an account';
    const description = isLogin
        ? 'Login with your Google or GitHub account'
        : 'Sign up with your Google or GitHub account';
    const toggleText = isLogin ? "Don't have an account?" : 'Already have an account?';
    const toggleLink = isLogin ? 'Sign up' : 'Login';
    const toggleHref = isLogin ? '/signup' : '/login';

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <a href="#" className="flex flex-col items-center gap-2 font-medium">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md">
                            <GalleryVerticalEnd className="size-6" />
                        </div>
                        <span className="sr-only">Accntu</span>
                    </a>

                    <CardTitle className="text-xl font-bold">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="flex flex-col gap-6">
                            <SocialAuth action={action} />
                            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                                    Or continue with
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
                    </form>
                </CardContent>
            </Card>
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                By clicking {action.toLowerCase()}, you agree to our{' '}
                <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    );
}
