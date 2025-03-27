import { AppSidebar, SiteHeader } from '@/components/layout';

import { SidebarProvider } from '@/components/ui/sidebar';
import { SIDEBAR_COOKIE } from '@/lib/constants';

import { cookies } from 'next/headers';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();

    const defaultOpen = cookieStore.get(SIDEBAR_COOKIE.NAME)?.value === 'true';

    //     <ProtectedRoute>
    //     <DashboardContent />
    // </ProtectedRoute>

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar variant="sidebar" collapsible="icon" />
            <div className="w-full">
                <SiteHeader />
                <main className="flex flex-1 flex-col h-screen p-6">{children}</main>
            </div>
        </SidebarProvider>
    );
}
