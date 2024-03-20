/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 */
export const publicRoutes: string[] = ['/landing', '/terms', '/privacy'];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /
 */
export const authRoutes: string[] = [
    '/login',
    '/register',
    '/auth/error',
    '/auth/verify'
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 */
export const apiAuthPrefix: string = '/api/auth';

/**
 * The default redirect path after logging in
 */
export const DEFAULT_LOGIN_REDIRECT = '/';

export const LOGIN_URL = '/login';
