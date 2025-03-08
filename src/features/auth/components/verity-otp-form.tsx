'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks';

import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { OTPVerifyFormSchema } from '../schemas';

import { Form, FormOTPInput, FormSubmitButton, useForm } from '@/components/form';

type VerifyOtpFormProps = React.ComponentPropsWithoutRef<'div'> & {
    email?: string;
};

export function VerifyOtpForm({ className, email, ...props }: VerifyOtpFormProps) {
    const { verifyLoginWithEmailOTP, initiateLoginWithEmailOTP, isLoading } = useAuth();

    const form = useForm({
        ...OTPVerifyFormSchema,
        onSubmit: async (values) => {
            await verifyLoginWithEmailOTP(values.code, {
                errorHandlers: {
                    default: (error) => {
                        toast.error('Test: Failed to verify OTP. Please try again.');
                        console.log('Hereddddddddddd, Verify OTP failed:', error);
                        form.setError('code', {
                            message: 'Failed to verify OTP. Please try again.',
                        });
                        form.reset();
                    },
                },
            });
        },
        onError: (errors) => {
            console.error('Form validation errors:', errors);
        },
    });

    const { formState, isSubmitting } = form;

    const handleResendCode = async () => {
        if (!email) {
            toast.error('Email not found. Please return to login page.');
            return;
        }

        try {
            await initiateLoginWithEmailOTP(email);
            form.reset();
            // Show success message
            toast.success('Code sent successfully. Please check your email.');
        } catch (err) {
            toast.error('Failed to resend code. Please try again.');
        }
    };

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Verify Your Login</CardTitle>
                    <CardDescription>Please enter the code sent to your Email</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form form={form} className="flex flex-col gap-4">
                        <FormOTPInput name="code" form={form} />

                        <FormSubmitButton
                            className="w-full"
                            form={form}
                            disabled={isLoading || isSubmitting}
                        >
                            Submit
                        </FormSubmitButton>
                        {formState.errors.code && (
                            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                                {formState.errors.code.message}
                            </div>
                        )}
                    </Form>

                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        <p>Didn&apos;t receive a code?</p>
                        <Button
                            className="m-0 p-0"
                            variant="link"
                            onClick={handleResendCode}
                            disabled={isLoading}
                        >
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
