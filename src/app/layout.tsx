import { QueryProvider, ThemeProvider } from '@/providers';
import { Inter } from 'next/font/google';

import { COOKIE_NAMES_SESSION } from '@/server/lib/cookies';
import { cookies } from 'next/headers';
import { Toaster } from 'react-hot-toast';
import './globals.css';
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Accntu',
    description: 'Modern accounting platform',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const session = cookieStore.get(COOKIE_NAMES_SESSION.AUTH_SESSION);

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <QueryProvider>
                    <Toaster />
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        <main className="">{children}</main>
                    </ThemeProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
