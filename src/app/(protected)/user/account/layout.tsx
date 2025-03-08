'use client';

import { ReactNode } from 'react';

interface AccountLayoutProps {
    children: ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <main className="flex-1">{children}</main>
        </div>
    );
}
