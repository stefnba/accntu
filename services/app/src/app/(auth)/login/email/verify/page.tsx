import VerifyEmailForm from '@/features/auth/components/verify-email-otp-form';

// import ResendButton from './_components/resend-button';

export default function VerifyEmail() {
    const email = 'd';

    return (
        <div>
            <VerifyEmailForm />
            <div className="mt-4">
                Didn&apos;t receive a code?
                {/* <ResendButton email={email || ''} /> */}
            </div>
        </div>
    );
}
