import { AppSidebar } from '@/components/layout';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ProtectedRoute } from '@/lib/auth/components/auth-guard';
import { auth } from '@/lib/auth/config';
import { SIDEBAR_COOKIE } from '@/lib/constants';
import { LOGIN_URL } from '@/lib/routes';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    // Server-side session check
    const sessionData = await auth.api.getSession({
        headers: await headers(),
    });

    // If no session on server, redirect immediately (prevents flash)
    if (!sessionData) {
        redirect(LOGIN_URL);
    }

    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get(SIDEBAR_COOKIE.NAME)?.value === 'true';

    return (
        <ProtectedRoute>
            <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar variant="sidebar" collapsible="icon" />
                <main className="flex flex-1 flex-col h-screen w-full">{children}</main>
            </SidebarProvider>
        </ProtectedRoute>
    );
}
