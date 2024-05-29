import { redirect } from 'next/navigation';

import Navbar from '@/features/app/components/navbar/Navbar';
import Sidebar from '@/features/app/components/sidebar/Sidebar';
import { authRoutes, validateRequest } from '@/lib/auth';
import { SessionProvider } from '@/providers/session';

interface Props {
    children: React.ReactNode;
}

export default async function ProtectedLayout({ children }: Readonly<Props>) {
    const session = await validateRequest();

    if (!session.session || !session.user) {
        redirect(authRoutes.LOGIN_URL);
    }

    return (
        <SessionProvider session={session}>
            <div className="flex h-full pt-[104px]">
                <Navbar />
                <Sidebar />
                <main className="top-[104px] w-full overflow-y-scroll px-6">
                    {children}
                </main>
            </div>
        </SessionProvider>
    );
}
