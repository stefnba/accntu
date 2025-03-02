import { VerifyOtpForm } from '@/features/auth/components/verity-otp-form';
import { cookies } from 'next/headers';

export default async function VerifyOtpPage() {
    const cookieStore = await cookies();
    const email = cookieStore.get('auth_email')?.value;

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-muted">
            <div className="w-full max-w-md">
                <VerifyOtpForm email={email} />
            </div>
        </div>
    );
}
