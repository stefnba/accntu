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

export const LOGIN_REDIRECT_URL = '/dashboard';
export const LOGIN_URL = '/login';
