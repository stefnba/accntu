import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SidebarProvider, SidebarTriggerMobile } from '@/components/ui/sidebar';
import { LOGIN_URL } from '@/lib/auth/routes';
import { ModalProvider } from '@/providers/modal';
import { SessionProvider } from '@/providers/session';
import { SheetProvider } from '@/providers/sheet';
import { validateRequest } from '@/server/auth/next/authenticate';
import Navbar from '@features/page/components/navbar/navbar';
import { AppSidebar } from '@features/page/components/sidebar/app-sidebar';

interface Props {
    children: React.ReactNode;
}

export default async function ProtectedLayout({ children }: Readonly<Props>) {
    const session = await validateRequest();

    if (!session.session || !session.user) {
        redirect(LOGIN_URL);
    }

    const cookieStore = cookies();
    const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';

    return (
        <SessionProvider session={session}>
            <SidebarProvider defaultOpen={defaultOpen}>
                <ModalProvider />
                <SheetProvider />

                {/* Sidebar */}
                <SidebarTriggerMobile />
                <AppSidebar />

                {/* Main */}
                <div className="w-screen h-screen max-h-screen">
                    <Navbar />

                    {/* Content */}
                    <main className="overflow-y-auto max-h-screen py-2 md:px-6 px-5 w-full">
                        {children}
                    </main>
                </div>
            </SidebarProvider>
        </SessionProvider>
    );
}
