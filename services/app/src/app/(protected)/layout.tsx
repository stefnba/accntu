import { redirect } from 'next/navigation';

import Navbar from '@/features/page/components/navbar/Navbar';
import Sidebar from '@/features/page/components/sidebar/Sidebar';
import { LOGIN_URL } from '@/lib/auth/routes';
import { ModalProvider } from '@/providers/modal';
import { SessionProvider } from '@/providers/session';
import { SheetProvider } from '@/providers/sheet';
import { validateRequest } from '@/server/auth/next/authenticate';

interface Props {
    children: React.ReactNode;
}

export default async function ProtectedLayout({ children }: Readonly<Props>) {
    const session = await validateRequest();

    if (!session.session || !session.user) {
        redirect(LOGIN_URL);
    }

    return (
        <SessionProvider session={session}>
            <ModalProvider />
            <SheetProvider />
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
