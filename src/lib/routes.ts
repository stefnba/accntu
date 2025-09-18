import * as Icons from '@/components/icons';
import { IconDatabase, IconFileWord, IconReport } from '@tabler/icons-react';
import { IconType } from 'react-icons';
import { UrlObject } from 'url';

export type RoutePath = __next_route_internal_types__.RouteImpl<UrlObject>;

export type TAppRoute = {
    path: RoutePath;
    label: string;
    icon?: IconType;
};

/**
 * Define public routes that are always accessible without authentication
 */
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

/**
 * Redirect URL after login
 */
export const LOGIN_REDIRECT_URL: RoutePath = '/dashboard';

/**
 * Login URL
 */
export const LOGIN_URL: RoutePath = '/login';

/**
 * Routes for the main sidebar.
 */
export const appRoutes: TAppRoute[] = [
    {
        path: '/dashboard',
        label: 'Dashboard',
        icon: Icons.Dashboard,
    },
    {
        path: '/transactions',
        label: 'Transactions',
        icon: Icons.Database,
    },
    {
        path: '/banks',
        label: 'Connected Banks',
        icon: Icons.Wallet,
    },
] as const;

export const secondaryRoutes: TAppRoute[] = [
    {
        label: 'Income & Expenses',
        path: '/budget',
        icon: IconDatabase,
    },
    {
        path: '/labels',
        label: 'Labels',
        icon: IconReport,
    },
    {
        label: 'Tags',
        path: '/tags',
        icon: IconFileWord,
    },
    {
        label: 'Buckets',
        path: '/buckets',
        icon: IconFileWord,
    },
];

/**
 * Routes for the user dropdown menu.
 */
export const userRoutes: TAppRoute[] = [
    {
        path: '/user',
        label: 'Account Center',
        icon: Icons.User,
    },
    {
        path: '/user/profile',
        label: 'Profile',
        icon: Icons.User,
    },
    {
        path: '/user/security',
        label: 'Security',
        icon: Icons.Security,
    },
];
