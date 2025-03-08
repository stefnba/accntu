import { clearCookie } from '@/server/lib/cookies';
import { errorFactory } from '@/server/lib/error';
import { Context } from 'hono';

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
