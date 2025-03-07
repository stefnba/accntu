import { TUser } from '@/server/db/schemas/user';
import { validateSession } from '@/server/features/auth/services/session';
import { clearCookie, getCookieValue } from '@/server/lib/cookies';
import { errorFactory } from '@/server/lib/error';
import { Context, Next } from 'hono';
import { z } from 'zod';
import { METHOD_PUBLIC_API_ROUTES, PUBLIC_API_ROUTES, ROLE_PROTECTED_ROUTES } from './config';
import { isMethodPathMatch, isPathMatch } from './utils';

/**
 * Define the auth context type
 */
export interface AuthContext {
    Variables: {
        user: TUser;
    };
}

/**
 * Global auth middleware that protects all routes except those in PUBLIC_API_ROUTES
 * This middleware:
 * 1. Checks if the route is public (no auth required)
 * 2. Validates the session cookie
 * 3. Sets the user on the context
 * 4. Checks role-based permissions
 */
export const globalAuthMiddleware = async (c: Context<AuthContext>, next: Next) => {
    const path = c.req.path;
    const method = c.req.method;

    // Skip auth for public routes (path only)
    if (isPathMatch(path, PUBLIC_API_ROUTES)) {
        return next();
    }

    // Skip auth for public routes (method + path)
    if (isMethodPathMatch(method, path, METHOD_PUBLIC_API_ROUTES)) {
        return next();
    }

    try {
        // Get session ID from cookie
        const sessionId = getCookieValue(c, 'SESSION', z.string());

        if (!sessionId) {
            throw errorFactory.createAuthError({
                message: 'No session found',
                code: 'AUTH.SESSION_NOT_FOUND',
                statusCode: 401,
            });
        }

        // Validate session and get user
        const user = await validateSession({ sessionId });

        // Set user on context
        c.set('user', user);

        // Check role-based access
        if (user.role) {
            for (const [role, patterns] of Object.entries(ROLE_PROTECTED_ROUTES)) {
                if (isPathMatch(path, patterns) && user.role !== role) {
                    throw errorFactory.createAuthError({
                        message: 'Forbidden - insufficient permissions',
                        code: 'AUTH.INVALID_CREDENTIALS',
                        statusCode: 403,
                    });
                }
            }
        }

        // Continue to the next middleware or route handler
        await next();
    } catch (error) {
        // Clear session cookie on auth error
        clearCookie(c, 'AUTH_SESSION');

        // Re-throw the error to be handled by the error handler
        throw error;
    }
};
