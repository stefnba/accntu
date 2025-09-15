import { auth } from '@/lib/auth/config';
import { LOGIN_REDIRECT_URL } from '@/lib/routes';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function PublicAuthLayout({ children }: { children: React.ReactNode }) {
    const sessionData = await auth.api.getSession({
        headers: await headers(),
    });
    const pathname = (await headers()).get('x-pathname');

    // redirect if user is already logged in
    // except for the auth/status page
    if (sessionData && pathname !== '/auth/status') return redirect(LOGIN_REDIRECT_URL);

    return <>{children}</>;
}
