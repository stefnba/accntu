'use client';

import { useConnectedBankEndpoints } from '@/features/bank/api';
import { Building2, ChevronRight, Home, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BankBreadcrumbProps {
    bankId?: string;
    accountId?: string;
}

export const BankBreadcrumb = ({ bankId, accountId }: BankBreadcrumbProps) => {
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
        <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-6">
            {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.href} className="flex items-center">
                    {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
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
