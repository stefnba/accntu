import { TUser } from '@/lib/auth/client';
import { auth } from '@/lib/auth/config';
import { updateSessionActivity } from '@/lib/auth/server/db/queries';
import { clearCookie } from '@/server/lib/cookies';
import { errorFactory } from '@/server/lib/error';
import { getRequestMetadata } from '@/server/lib/request';
import { Context, Next } from 'hono';
import { isPathMatch } from '../utils';
import { ROLE_PROTECTED_ROUTES } from './config';

/**
 * Validate the session from the request cookie and return the user and session
 * @throws AuthError if session is invalid
 */
export const validateSession = async <T extends Context>(c: T) => {
    try {
        // Use Better Auth's built-in session validation
        // Cookie caching is handled automatically based on the config
        const result = await auth.api.getSession({
            headers: c.req.raw.headers,
        });

        if (!result || !result.session) {
            clearCookie(c, 'AUTH_SESSION');
            throw errorFactory.createAuthError({
                code: 'SESSION_TOKEN_NOT_FOUND',
                statusCode: 401,
            });
        }

        return result;
    } catch (err) {
        clearCookie(c, 'AUTH_SESSION');
        throw errorFactory.createAuthError({
            code: 'SESSION_TOKEN_NOT_FOUND',
            statusCode: 401,
            cause: err instanceof Error ? err : new Error(`${err}`),
        });
    }
};

/**
 * Get the current session without throwing an error
 * @returns Session and user
 * @throws AuthError if session or user is not found in context
 */
export const getSession = <T extends Context>(c: T) => {
    const session = c.get('session');

    if (!session) {
        throw errorFactory.createAuthError({
            message: 'Session not found in context',
            code: 'SESSION_NOT_IN_CONTEXT',
        });
    }

    return session;
};

/**
 * Get the current user without throwing an error
 * @returns User
 * @throws AuthError if user is not found in context
 */
export const getUser = (c: Context) => {
    const user = c.get('user');

    if (!user) {
        throw errorFactory.createAuthError({
            message: 'User not found in context',
            code: 'USER_NOT_IN_CONTEXT',
        });
    }

    return user;
};

export const validateAndSetAuthContext = async (c: Context) => {
    const path = c.req.path;

    try {
        const session = await validateSession(c);

        // Set user and session on context
        c.set('user', session.user);
        c.set('session', session.session);

        // Update the session activity with current request information
        // Using the utility function to get IP and user agent
        const { ipAddress, userAgent } = getRequestMetadata(c);

        // Using fire-and-forget pattern to avoid waiting for the update
        updateSessionActivity({
            sessionId: session.session.id,
            ipAddress,
            userAgent,
        }).catch((err) => {
            console.error('Failed to update session activity:', err);
        });

        // Check role-based access
        await validateRolePermission(session.user, path);
    } catch (error) {
        // Clear session cookie on auth error
        clearCookie(c, 'AUTH_SESSION');

        // Re-throw the error to be handled by the error handler
        throw error;
    }
};

export const validateRolePermission = async (user: TUser, path: string) => {
    // Check role-based access
    if (user.role) {
        for (const [role, patterns] of Object.entries(ROLE_PROTECTED_ROUTES)) {
            if (isPathMatch(path, patterns) && user.role !== role) {
                // todo update error message
                throw errorFactory.createAuthError({
                    message: 'Forbidden - insufficient permissions',
                    code: 'INVALID_CREDENTIALS',
                    statusCode: 403,
                });
            }
        }
    }
};

export const protectedServerRoute = async (c: Context, next: Next) => {
    await validateAndSetAuthContext(c);

    // Continue to the next route handler
    await next();
};
