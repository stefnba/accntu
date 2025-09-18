'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { emailOTPVerifySchema } from '@/features/auth/schemas';
import { cn } from '@/lib/utils';

import { useForm } from '@/components/form';
import { useSignIn } from '@/lib/auth/client';
import { useEffect, useRef } from 'react';

type VerifyOtpFormProps = React.ComponentPropsWithoutRef<'div'> & {
    email: string;
};

export function VerifyOtpForm({ className, email, ...props }: VerifyOtpFormProps) {
    const { verifyEmailOTP, isSigningIn } = useSignIn();
    const hasAutoSubmitted = useRef(false);

    const { form, Form, OTPInput, SubmitButton } = useForm({
        schema: emailOTPVerifySchema,
        onSubmit: (values) => {
            verifyEmailOTP(email, values.code);
        },
        onError: (errors) => {
            console.error('Form validation errors:', errors);
            hasAutoSubmitted.current = false;
        },
    });

    const { formState, isSubmitting } = form;

    useEffect(() => {
        const subscription = form.watch((value) => {
            const code = value.code;
            if (code?.length === 8 && !isSubmitting && !isSigningIn && !hasAutoSubmitted.current) {
                hasAutoSubmitted.current = true;
                form.handleSubmit();
            }
        });

        return () => subscription.unsubscribe();
    }, [form, isSubmitting, isSigningIn]);

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-semibold">Verify Your Login</CardTitle>
                    <CardDescription>Please enter the code sent to your Email</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form className="flex flex-col gap-4">
                        <OTPInput name="code" />

                        <SubmitButton className="w-full" disabled={isSubmitting || isSigningIn}>
                            Submit
                        </SubmitButton>
                        {formState.errors.code && (
                            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                                {formState.errors.code.message}
                            </div>
                        )}
                    </Form>

                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        <p>Didn&apos;t receive a code?</p>
                        <Button className="m-0 p-0" variant="link" disabled={isSigningIn}>
                            Resend
                        </Button>
                        {' or '}
                        <a href="/login" className="text-primary hover:underline">
                            return to login
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
