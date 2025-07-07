'use client';

import { BackButton } from '@/components/back-button';
import Link from 'next/link';

export const TransactionNavigation = () => {
    return (
        <div className="flex items-center gap-4">
            <BackButton path="/transactions" />
            <nav className="text-sm text-muted-foreground">
                <Link href="/transactions" className="hover:text-foreground">
                    Transactions
                </Link>
                <span className="mx-2">/</span>
                <span className="text-foreground">Transaction Details</span>
            </nav>
        </div>
    );
};
