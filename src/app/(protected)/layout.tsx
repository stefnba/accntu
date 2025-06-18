import { AppSidebar, SiteHeader } from '@/components/layout';

import { SidebarProvider } from '@/components/ui/sidebar';
import { ProtectedRoute } from '@/lib/auth/components/protected-route';
import { auth } from '@/lib/auth/config';
import { SIDEBAR_COOKIE } from '@/lib/constants';
import { LOGIN_URL } from '@/lib/routes';
import { headers } from 'next/headers';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();

    const defaultOpen = cookieStore.get(SIDEBAR_COOKIE.NAME)?.value === 'true';

    // Pre-fetch session data server-side and hydrate the client state
    const sessionData = await auth.api.getSession({
        headers: await headers(),
    });

    // If no session, redirect to login
    if (!sessionData) {
        redirect(LOGIN_URL);
    }

    return (
        <ProtectedRoute initialSession={sessionData}>
            <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar variant="sidebar" collapsible="icon" />
                <div className="w-full">
                    <SiteHeader />
                    <main className="flex flex-1 flex-col h-screen">{children}</main>
                </div>
            </SidebarProvider>
        </ProtectedRoute>
    );
}
