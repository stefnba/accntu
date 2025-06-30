import { auth } from '@/lib/auth/config';
import { LOGIN_REDIRECT_URL } from '@/lib/routes';
import { headers } from 'next/headers';

import { redirect } from 'next/navigation';

export default async function PublicHomeLayout({ children }: { children: React.ReactNode }) {
    const sessionData = await auth.api.getSession({
        headers: await headers(),
    });

    // redirect if user is already logged in
    if (sessionData) return redirect(LOGIN_REDIRECT_URL);

    return <>{children}</>;
}
