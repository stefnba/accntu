'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { emailOTPVerifySchema } from '@/features/auth/schemas';
import { cn } from '@/lib/utils';

import { Form, FormOTPInput, FormSubmitButton, useForm } from '@/components/form';
import { useAuth } from '@/lib/auth/client';

type VerifyOtpFormProps = React.ComponentPropsWithoutRef<'div'> & {
    email: string;
};

export function VerifyOtpForm({ className, email, ...props }: VerifyOtpFormProps) {
    const { signIn, isLoading } = useAuth();

    const form = useForm({
        schema: emailOTPVerifySchema,
        onSubmit: (values) => {
            signIn.emailOTP.verify(email, values.code);
        },
        onError: (errors) => {
            console.error('Form validation errors:', errors);
        },
    });

    const { formState, isSubmitting } = form;

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
                            disabled={isSubmitting || isLoading}
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
                        <Button className="m-0 p-0" variant="link" disabled={isLoading}>
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
