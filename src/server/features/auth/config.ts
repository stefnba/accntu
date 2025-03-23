import { TUserRole } from '@/server/db/schemas';
import { HTTP_METHOD as THTTPMethods } from 'next/dist/server/web/http';

/**
 * List of public API routes that don't require authentication, any path listed here will be skipped in middleware.
 *
 * We can use wildcards or detailed routes.
 */
export const PUBLIC_API_ROUTES = [
    // Auth routes - all except logout
    '/api/auth/*![logout]',

    // Health check and other public endpoints
    '/api/health',
    '/api/version',
];

/**
 * Method-specific public API routes that don't require authentication.
 * These are checked in the globalAuthMiddleware after the path-only PUBLIC_API_ROUTES.
 *
 * Format: [HTTP method, path]
 * Use '*' for the method to match any HTTP method
 *
 * In the middleware, these are checked to see if the HTTP method and path match before allowing unauthenticated access.
 * This means that only the listed methods will be allowed for the listed paths.
 */
export const METHOD_PUBLIC_API_ROUTES: Array<[THTTPMethods | '*', string]> = [
    // All methods for auth routes are public
    // ['*', '/api/auth/*'],

    // Health check endpoints
    ['GET', '/api/health'],
    ['GET', '/api/version'],
];

/**
 * Role-based protected routes
 * Routes that require specific user roles
 */
export const ROLE_PROTECTED_ROUTES: Record<TUserRole, string[]> = {
    admin: ['/api/admin/*', '/api/settings/*'],
    user: [],
};

/**
 * Authentication cookie configuration
 */
export const AUTH_COOKIE_CONFIG = {
    SESSION_COOKIE_NAME: 'AUTH_SESSION',
    SESSION_DURATION_DAYS: 7,
};

/**
 * OTP configuration
 */
export const OTP_CONFIG = {
    CODE_LENGTH: 8,
    EXPIRES_IN: 10 * 60, // 10 minutes in seconds
    MAX_ATTEMPTS: 3,
};
