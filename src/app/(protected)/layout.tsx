import { LOGIN_URL } from '@/lib/config';
import { COOKIE_NAMES_SESSION } from '@/server/lib/cookies';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const session = cookieStore.get(COOKIE_NAMES_SESSION.AUTH_SESSION);

    if (!session) {
        redirect(LOGIN_URL);
    }

    return <>{children}</>;
}
