/**
 * List of public API routes that don't require authentication
 */
export const PUBLIC_API_ROUTES = [
    // Auth routes
    '/api/auth/request-otp',
    '/api/auth/verify-otp',
    '/api/auth/signup',
    '/api/auth/logout',
    '/api/auth/:provider/authorize',
    '/api/auth/:provider/callback',

    // Alternatively, use wildcards for all auth routes
    // '/api/auth/*',

    // Health check and other public endpoints
    '/api/health',
    '/api/version',
];

/**
 * Method-specific public routes
 * Format: [HTTP method, path]
 * Use '*' for the method to match any HTTP method
 */
export const METHOD_PUBLIC_API_ROUTES: Array<[string, string]> = [
    // Allow GET requests to products without auth
    ['GET', '/api/products/*'],

    // All methods for auth routes are public
    ['*', '/api/auth/*'],

    // Health check endpoints
    ['GET', '/api/health'],
    ['GET', '/api/version'],
];

/**
 * Role-based protected routes
 * Routes that require specific user roles
 */
export const ROLE_PROTECTED_ROUTES: Record<string, string[]> = {
    admin: ['/api/admin/*', '/api/settings/*'],
    manager: ['/api/reports/*', '/api/analytics/*'],
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
