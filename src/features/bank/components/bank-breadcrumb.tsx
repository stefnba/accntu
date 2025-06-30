'use client';

import { useConnectedBankEndpoints } from '@/features/bank/api';
import { cn } from '@/lib/utils';
import { Building2, ChevronRight, Home, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BankBreadcrumbProps {
    bankId?: string;
    accountId?: string;
    className?: string;
}

export const BankBreadcrumb = ({ bankId, accountId, className }: BankBreadcrumbProps) => {
    const pathname = usePathname();
    const { data: bank } = useConnectedBankEndpoints.getById({
        param: { id: bankId || '' },
    });
    // const { data: account } = useConnectedBankAccountEndpoints.getById({
    //     param: { id: accountId || '' },
    // });

    const breadcrumbs = [
        {
            label: 'Banks',
            href: '/banks',
            icon: <Home className="h-4 w-4" />,
        },
    ];

    if (bankId && bank) {
        breadcrumbs.push({
            label: bank.globalBank?.name || 'Bank',
            href: `/banks/${bankId}`,
            icon: <Building2 className="h-4 w-4" />,
        });

        if (pathname.includes('/settings')) {
            breadcrumbs.push({
                label: 'Settings',
                href: `/banks/${bankId}/settings`,
                icon: <Settings className="h-4 w-4" />,
            });
        }

        // if (accountId && account) {
        //     breadcrumbs.push({
        //         label: account.name || 'Account',
        //         href: `/banks/${bankId}/accounts/${accountId}`,
        //         icon: <CreditCard className="h-4 w-4" />,
        //     });
        // }
    }

    return (
        <nav className={cn('flex items-center space-x-1 text-sm text-gray-500', className)}>
            {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.href} className="flex items-center">
                    {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
                    <Link
                        href={(breadcrumb.href as any) || '/'}
                        className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                    >
                        {breadcrumb.icon}
                        <span>{breadcrumb.label}</span>
                    </Link>
                </div>
            ))}
        </nav>
    );
};
