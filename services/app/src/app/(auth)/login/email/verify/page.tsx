import ResendButton from '@/features/auth/components/resend-button';
import VerifyEmailForm from '@/features/auth/components/verify-email-otp-form';

export default function VerifyEmail() {
    return (
        <div>
            <VerifyEmailForm />
            <div className="mt-4">
                <span className="text-sm text-muted-foreground">
                    Didn&apos;t receive a code?
                    <ResendButton />
                </span>
            </div>
        </div>
    );
}
