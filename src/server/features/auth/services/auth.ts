import { sessionServices } from '@/server/features/auth/services';
import { clearCookie, getCookieValue } from '@/server/lib/cookies';
import { errorFactory } from '@/server/lib/error';
import { Context } from 'hono';
import { z } from 'zod';

/**
 * Get the user from the context
 * If the user is not found, clear the session cookie and throw an error
 * @param c - The context
 * @returns The user
 */
export const getUserFromContext = (c: Context) => {
    const user = c.get('user');
    if (!user) {
        // remove session cookie
        clearCookie(c, 'AUTH_SESSION');

        throw errorFactory.createAuthError({
            message: 'User not found',
            code: 'AUTH.USER_NOT_IN_CONTEXT',
        });
    }
    return user;
};

/**
 * Get the session ID from the context
 * If the session ID is not found and throwError is true, throw an error and clear the session cookie
 * If the session ID is not found and throwError is false, return null
 * @param c - The context
 * @param throwError - Whether to throw an error if the session ID is not found. Defaults to true
 * @returns The session ID
 */
export function getSessionIdFromContext(c: Context, throwError?: true): string;
export function getSessionIdFromContext(c: Context, throwError: false): string | null;
export function getSessionIdFromContext(c: Context, throwError = true): string | null {
    const sessionId = getCookieValue(c, 'AUTH_SESSION', z.string().optional().nullable());
    if (!sessionId && throwError) {
        // Clear the session cookie
        clearCookie(c, 'AUTH_SESSION');

        throw errorFactory.createAuthError('AUTH.EMPTY_SESSION_TOKEN');
    } else if (!sessionId) {
        return null;
    }
    return sessionId;
}

export const logout = async ({ userId, sessionId }: { userId: string; sessionId: string }) => {
    await sessionServices.deleteSession({ sessionId, userId });
};
