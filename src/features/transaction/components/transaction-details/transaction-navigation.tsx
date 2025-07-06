'use client';

import { Button } from '@/components/ui/button';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const TransactionNavigation = () => {
    const router = useRouter();

    return (
        <div className="flex items-center gap-4">
            <Button
                className="cursor-pointer"
                variant="outline"
                size="sm"
                onClick={() => router.back()}
            >
                <IconArrowLeft className="h-4 w-4" />
                Back
            </Button>
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
