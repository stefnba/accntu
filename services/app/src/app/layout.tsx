import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';

import { QueryProvider } from '@/providers/query';
import { ThemeProvider } from '@/providers/theme';
import { cn } from '@lib/utils';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'react-hot-toast';

import './globals.css';

const fontSans = FontSans({
    subsets: ['latin'],
    variable: '--font-sans'
});

export const metadata: Metadata = {
    title: 'accntu',
    description: 'The smart budget app for your everyday needs.'
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={cn(
                    'bg-background min-h-screen font-sans antialiased',
                    fontSans.variable
                )}
            >
                <QueryProvider>
                    <NuqsAdapter>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                            disableTransitionOnChange
                        >
                            {children}
                            <Toaster />
                        </ThemeProvider>
                    </NuqsAdapter>
                </QueryProvider>
            </body>
        </html>
    );
}
