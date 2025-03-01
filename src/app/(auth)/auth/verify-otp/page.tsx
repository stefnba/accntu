import { VerifyOtpForm } from '@/features/auth/components/verity-otp-form';

export default function VerifyOtpPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-muted">
            <div className="w-full max-w-sm">
                <VerifyOtpForm />
            </div>
        </div>
    );
}
