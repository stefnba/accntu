'use client';

import { useResendEmailOTP } from '@/features/auth/api/resend-email-otp';

interface Props {}

export default function ResendButton({}: Props) {
    const { mutate } = useResendEmailOTP();

    return (
        <button
            className="ml-1 text-primary hover:underline"
            onClick={() => mutate()}
        >
            Resend
        </button>
    );
}
