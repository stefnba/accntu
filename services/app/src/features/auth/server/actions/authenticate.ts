import { findUser } from '@/features/user/server/actions';
import { lucia } from '@features/auth/server/lucia';
import { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import { User } from 'lucia';

import { SESSION_USER } from '../config';

/**
 * Get the user object from the Hono context.
 * @param c Hono context.
 * @returns User object.
 */
export const getUser = (c: Context): User => {
    const user = c.get('user');

    if (!user) {
        throw new HTTPException(401, { message: 'Custom error message' });
    }

    return user;
};

/**
 * Create a session and set the session cookie with Hono.
 * @param c Hono context.
 * @param userId The userId to create the session for.
 */
export const createSession = async (
    c: Context,
    userId: string
): Promise<void> => {
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    const { httpOnly, path, secure, maxAge } = sessionCookie.attributes;

    // session user cookie
    const user = await findUser(userId);
    if (user) {
        setCookie(c, SESSION_USER.COOKIE_NAME, JSON.stringify(user), {
            path,
            secure,
            httpOnly,
            maxAge,
            sameSite: 'Lax'
        });
    }

    // session id cookie
    setCookie(c, sessionCookie.name, sessionCookie.value, {
        path,
        secure,
        httpOnly,
        maxAge,
        sameSite: 'Lax'
    });
};

/**
 * Invalidate the session and remove the session cookie with Hono.
 * Can be used for logout.
 * @param c Hono context.
 */
export const invalidateSession = async (c: Context): Promise<void> => {
    const sessionId = getCookie(c, lucia.sessionCookieName) ?? null;

    if (sessionId) {
        await lucia.invalidateSession(sessionId);
    }

    // remove session user cookie
    deleteCookie(c, SESSION_USER.COOKIE_NAME);

    c.header('Set-Cookie', lucia.createBlankSessionCookie().serialize(), {
        append: true
    });
};
