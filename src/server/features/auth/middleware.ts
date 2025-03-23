import { TUser } from '@/server/db/schemas/user';
import { updateSessionActivity } from '@/server/features/auth/queries/session';
import { getSessionIdFromContext } from '@/server/features/auth/services/auth';
import { validateSession } from '@/server/features/auth/services/session';
import { clearCookie } from '@/server/lib/cookies';
import { errorFactory } from '@/server/lib/error';
import { getRequestMetadata } from '@/server/lib/request';
import { Context, Next } from 'hono';
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
        // Get session ID from cookie, getSessionIdFromContext throws error if not found
        const sessionId = getSessionIdFromContext(c, true);

        // Validate session and get user
        const user = await validateSession({ sessionId });

        // Set user on context
        c.set('user', user);

        // Update the session activity with current request information
        // Using the utility function to get IP and user agent
        const { ipAddress, userAgent } = getRequestMetadata(c);

        // Using fire-and-forget pattern to avoid waiting for the update
        updateSessionActivity({
            sessionId,
            ipAddress,
            userAgent,
        }).catch((err) => {
            console.error('Failed to update session activity:', err);
        });

        // Check role-based access
        if (user.role) {
            for (const [role, patterns] of Object.entries(ROLE_PROTECTED_ROUTES)) {
                if (isPathMatch(path, patterns) && user.role !== role) {
                    // todo update error message
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
