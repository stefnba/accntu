import { redirect } from 'next/navigation';

import { authRoutes, validateRequest } from '@/lib/auth';
import { SessionProvider } from '@/lib/auth/provider';

import Navbar from './_components/navbar/Navbar';
import Sidebar from './_components/sidebar/Sidebar';

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
