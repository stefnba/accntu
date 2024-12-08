import { cookies } from 'next/headers';

import { SidebarProvider, SidebarTriggerMobile } from '@/components/ui/sidebar';
import { SessionUserProvider } from '@/features/auth/providers/session';
import { getUser } from '@/features/auth/server/next/';
import { ModalProvider } from '@/providers/modal';
import { SheetProvider } from '@/providers/sheet';
import Navbar from '@features/page/components/navbar/navbar';
import { AppSidebar } from '@features/page/components/sidebar/app-sidebar';

interface Props {
    children: React.ReactNode;
}

export default async function ProtectedLayout({ children }: Readonly<Props>) {
    const user = await getUser();

    // cookie for sidebar default state
    const cookieStore = cookies();
    const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';
    return (
        <SessionUserProvider sessionUser={user}>
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
        </SessionUserProvider>
    );
}
