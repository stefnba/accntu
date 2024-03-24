'use client';

import {
    LuCreditCard,
    LuDownload,
    LuImport,
    LuLayoutDashboard,
    LuPiggyBank,
    LuSettings,
    LuWallet
} from 'react-icons/lu';

const routes = [
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
        label: 'Settings',
        href: '/settings'
    }
];

export default routes;
