'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/hooks';
import { useZodForm } from '@/hooks/use-form';
import { cn } from '@/lib/utils';
import { OTPVerifyFormSchema } from '../schemas';
type VerifyOtpFormProps = React.ComponentPropsWithoutRef<'div'>;

export function VerifyOtpForm({ className, ...props }: VerifyOtpFormProps) {
    const { verifyOtp, isLoading } = useAuth();

    const form = useZodForm({
        ...OTPVerifyFormSchema,
        onSubmit: async (values) => {
            await verifyOtp(values.code);
        },
        onError: (errors) => {
            console.error('Form validation errors:', errors);
            form.reset();
        },
    });

    const { watch, setValue, formState, handleSubmit, isSubmitting } = form;
    const otp = watch('code');

    // Handle API errors
    const onSubmitWithErrorHandling = async (e?: React.BaseSyntheticEvent) => {
        try {
            await handleSubmit(e);
        } catch (err) {
            form.setError('code', {
                message: 'Failed to verify OTP. Please try again.',
            });
        }
    };

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
                    <CardDescription>
                        Enter the 6-digit code sent to your email to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmitWithErrorHandling} className="flex flex-col gap-4">
                        {formState.errors.code && (
                            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                                {formState.errors.code.message}
                            </div>
                        )}

                        <div className="flex justify-center my-4">
                            <InputOTP
                                maxLength={6}
                                value={otp}
                                onChange={(value) => setValue('code', value)}
                                disabled={isLoading || isSubmitting}
                                className="scale-110"
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                </InputOTPGroup>

                                <InputOTPGroup>
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <Button
                            type="submit"
                            className="mt-4"
                            disabled={isLoading || isSubmitting || otp.length !== 6}
                        >
                            {isLoading || isSubmitting ? 'Verifying...' : 'Verify OTP'}
                        </Button>

                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            <p>Didn&apos;t receive a code?</p>
                            <a href="/auth/login" className="text-primary hover:underline">
                                Try again
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
