'use client';

import {
    LuCreditCard,
    LuImport,
    LuLayoutDashboard,
    LuSettings,
    LuWallet
} from 'react-icons/lu';

export type Route = {
    icon: React.ElementType;
    label: string;
    href: string;
    routes?: Route[];
};

const routes: Route[] = [
    {
        icon: LuLayoutDashboard,
        label: 'Dashboard',
        href: '/'
    },
    {
        icon: LuImport,
        label: 'Imports',
        href: '/import'
    },
    {
        icon: LuWallet,
        label: 'Budget',
        href: '/budget'
    },
    {
        icon: LuCreditCard,
        label: 'Transactions',
        href: '/transaction'
    },
    {
        icon: LuSettings,
        label: 'Admin',
        href: '/settings',
        routes: [
            {
                icon: LuSettings,
                label: 'Bank Accounts',
                href: '/account'
            },
            {
                icon: LuSettings,
                label: 'Labels',
                href: '/label'
            },
            {
                icon: LuSettings,
                label: 'Tags',
                href: '/tag'
            }
        ]
    }
];

export default routes;
