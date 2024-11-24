// 'use client';
import {
    LuCreditCard,
    LuImport,
    LuLayoutDashboard,
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
        label: 'Admin',
        href: '/settings'
    }
];

export default routes;
