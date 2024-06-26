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
    '/login/**',
    '/register**',
    '/auth/**'
];

/**
 * The default redirect path after logging in
 */
export const DEFAULT_LOGIN_REDIRECT = '/';

/**
 * The URL to the login page
 */
export const LOGIN_URL = '/login';

/**
 * The URL to the logout page
 */
export const LOGOUT_URL = '/logout';

/**
 * The URL to the OTP verification page for Email login.
 */
export const EMAIL_OTP_REDIRECT_URL = '/login/email/verify';
