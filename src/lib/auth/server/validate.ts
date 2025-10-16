import { type TUser } from '@/lib/auth';
import { auth } from '@/lib/auth/config';
import { updateSessionActivity } from '@/lib/auth/server/db/queries';
import { AuthContext } from '@/lib/auth/server/types';
import { clearCookie } from '@/server/lib/cookies';
import { AppErrors } from '@/server/lib/error';
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
            throw AppErrors.auth('SESSION_NOT_FOUND', {
                message: 'Session token not found',
            });
        }

        return result;
    } catch (err) {
        clearCookie(c, 'AUTH_SESSION');
        throw AppErrors.auth('SESSION_NOT_FOUND', {
            message: 'Session token not found',
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
        throw AppErrors.auth('SESSION_CONTEXT_ERROR', {
            message: 'Session not found in hono context',
            details: { context: 'getSession' },
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
        throw AppErrors.auth('SESSION_CONTEXT_ERROR', {
            message: 'User not found in hono context',
            details: { context: 'getUser' },
        });
    }

    return user;
};

/**
 * Validate the session and set the user and session on the context.
 * This is used in the authMiddleware to set the user and session on the context.
 * @param c - The context
 * @returns The session and user
 * @throws AuthError if session is invalid
 */
export const validateAndSetAuthContext = async (c: Context): Promise<AuthContext> => {
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

        return {
            user: session.user,
            session: session.session,
        };
    } catch (error) {
        // Clear session cookie on auth error
        clearCookie(c, 'AUTH_SESSION');

        // Re-throw the error to be handled by the error handler
        throw error;
    }
};

/**
 * Validate the role-based access for the user.
 * @param user - The user
 * @param path - The path
 * @throws AuthError if the user does not have the required role
 */
export const validateRolePermission = async (user: TUser | null, path: string) => {
    if (!user) {
        throw AppErrors.auth('SESSION_CONTEXT_ERROR', {
            message: 'User not found in hono context',
            details: { context: 'validateRolePermission' },
        });
    }

    // Check role-based access
    if (user.role) {
        for (const [role, patterns] of Object.entries(ROLE_PROTECTED_ROUTES)) {
            if (isPathMatch(path, patterns) && user.role !== role) {
                // throw error but don't log out the user
                throw AppErrors.permission('INSUFFICIENT_ROLE', {
                    message: 'Forbidden - insufficient permissions',
                    details: { requiredRole: role, userRole: user.role, path },
                });
            }
        }
    }
};

/**
 * Protected server route middleware.
 * This is used to protect server routes.
 * @param c - The context
 * @param next - The next middleware
 */
export const protectedServerRoute = async (c: Context, next: Next) => {
    await validateAndSetAuthContext(c);

    // Continue to the next route handler
    await next();
};
