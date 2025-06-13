import { VerifyOtpForm } from '@/features/auth/components/forms/verity-otp-form';
import { COOKIE_NAMES_AUTH } from '@/server/lib/cookies';
import { cookies } from 'next/headers';

export default async function VerifyOtpPage() {
    const cookieStore = await cookies();
    const email = cookieStore.get(COOKIE_NAMES_AUTH.AUTH_OTP_EMAIL)?.value;

    if (!email) {
        return <div>No email found</div>;
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-muted">
            <div className="w-full max-w-md">
                <VerifyOtpForm email={email} />
            </div>
        </div>
    );
}
