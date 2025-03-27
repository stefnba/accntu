import { IconDatabase, IconLock, IconNotification, IconUserCircle } from '@tabler/icons-react';
import { LucideLayoutDashboard, LucideWallet } from 'lucide-react';
import { UrlObject } from 'url';

type RoutePath = __next_route_internal_types__.RouteImpl<UrlObject>;

export type TAppRoute = {
    path: RoutePath;
    label: string;
    icon?: React.ElementType;
};

// Define public routes that are always accessible without authentication
export const PUBLIC_ROUTES = [
    // Auth routes
    '/login',
    '/signup',
    '/auth/*',

    // Public pages
    '/',
    '/about',
    '/contact',
    '/pricing',
    '/terms',
    '/privacy',

    // Static assets and Next.js internals
    '/_next/*',
    '/favicon.ico',
    '/static/*',
    '/images/*',
];

export const LOGIN_REDIRECT_URL: RoutePath = '/dashboard';
export const LOGIN_URL: RoutePath = '/login';

export const appRoutes: TAppRoute[] = [
    {
        path: '/dashboard',
        label: 'Dashboard',
        icon: LucideLayoutDashboard,
    },
    {
        path: '/transaction',
        label: 'Transactions',
        icon: IconDatabase,
    },
    {
        path: '/budget',
        label: 'Budget',
        icon: LucideWallet,
    },
] as const;

export const userRoutes: TAppRoute[] = [
    {
        path: '/user/account',
        label: 'Account',
        icon: IconUserCircle,
    },
    {
        path: '/user/notification',
        label: 'Notifications',
        icon: IconNotification,
    },
    {
        path: '/user/security',
        label: 'Security',
        icon: IconLock,
    },
];
