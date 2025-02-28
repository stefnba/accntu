import { QueryProvider, ThemeProvider } from '@/providers';

import { Inter } from 'next/font/google';
import './globals.css';
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Accntu',
    description: 'Modern accounting platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <QueryProvider>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        <main className="">{children}</main>
                    </ThemeProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
