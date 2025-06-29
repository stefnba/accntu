import { auth } from '@/lib/auth/config';
import { LOGIN_URL } from '@/lib/routes';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const sessionData = await auth.api.getSession({
        headers: await headers(),
    });

    if (!sessionData) {
        redirect(LOGIN_URL);
    }

    const { user } = sessionData;

    if (!user || user.role !== 'admin') {
        redirect('/dashboard');
    }

    return (
        <SidebarProvider defaultOpen={true}>
            <AdminSidebar />
            <main className="flex flex-1 flex-col h-screen w-full bg-muted/10">
                <div className="flex-1 p-6">{children}</div>
            </main>
        </SidebarProvider>
    );
}