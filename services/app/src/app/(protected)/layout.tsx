import { redirect } from 'next/navigation';

import { SidebarProvider } from '@/components/ui/sidebar';
import { LOGIN_URL } from '@/lib/auth/routes';
import { ModalProvider } from '@/providers/modal';
import { SessionProvider } from '@/providers/session';
import { SheetProvider } from '@/providers/sheet';
import { validateRequest } from '@/server/auth/next/authenticate';
import Navbar from '@features/page/components/navbar/navbar';
import { SidebarTogglMobile } from '@features/page/components/navbar/toggle';
import { AppSidebar } from '@features/page/components/sidebar/app-sidebar';

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
            <SidebarProvider>
                <SidebarTogglMobile />
                <ModalProvider />
                <SheetProvider />
                <div className="w-screen flex h-screen max-h-screen">
                    <AppSidebar />

                    <Navbar />
                    <main className=" h-screen overflow-y-auto max-h-screen md:px-10 px-5 w-full">
                        {children}
                    </main>
                </div>
            </SidebarProvider>
        </SessionProvider>
    );
}
