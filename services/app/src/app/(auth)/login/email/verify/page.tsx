import { cookies } from 'next/headers';

import { EMAIL_COOKIE_NAME } from '@/auth/actions/mail/config';

import VerifyEmailForm from './_components/form';
import ResendButton from './_components/resend-button';

export default function VerifyEmail() {
    const email = cookies().get(EMAIL_COOKIE_NAME)?.value ?? null;

    return (
        <div>
            <VerifyEmailForm />
            <div className="mt-4">
                Didn&apos;t receive a code?
                <ResendButton email={email || ''} />
            </div>
        </div>
    );
}
