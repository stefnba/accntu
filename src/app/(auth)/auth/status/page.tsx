import { Separator } from '@/components/ui/separator';
import { AuthStatusClient } from '@/features/auth/components/dev-auth-status';
import { auth } from '@/lib/auth/config';
import { LOGIN_REDIRECT_URL } from '@/lib/routes';
import { headers } from 'next/headers';

import { redirect } from 'next/navigation';

export default async function AuthStatusPage() {
    const session = await auth.api.getSession({ headers: await headers() });

    // redirect if not in development
    if (process.env.NODE_ENV !== 'development') {
        return redirect(LOGIN_REDIRECT_URL);
    }

    return (
        <div className="m-4">
            <h2 className="text-2xl font-bold">Server Session</h2>

            <div>
                <div>ID: {session?.user.id}</div>
                <div>Email: {session?.user.email}</div>
                <div>
                    Name: {session?.user.name} {session?.user.lastName}
                </div>
            </div>

            <Separator className="my-4" />
            <AuthStatusClient />
        </div>
    );
}
