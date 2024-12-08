import { cookies } from 'next/headers';

import { findUser } from '@/features/user/server/actions';
import {
    createSession,
    generateSessionToken,
    invalidateSession
} from '@features/auth/server/actions/session';
import {
    deleteSessionTokenCookie,
    getSessionTokenCookie,
    setSessionTokenCookie
} from '@features/auth/server/cookies/session';
import {
    deleteSessionUserCookie,
    setSessionUserCookie
} from '@features/auth/server/cookies/session-user';
import { Context } from 'hono';

import { SESSION_COOKIE } from '../../config';

/**
 * Create a session and set the session cookie with Hono.
 * @param c Hono context.
 * @param userId The userId to create the session for.
 */
export const login = async (c: Context, userId: string): Promise<void> => {
    const token = generateSessionToken();
    const session = await createSession(token, userId);

    // set session token cookie
    setSessionTokenCookie(c, token, session.expiresAt);

    // set session user cookie
    const user = await findUser(userId);
    if (user) {
        setSessionUserCookie(c, user, session.expiresAt);
    }
};

/**
 * Logout user.
 * Deletes session record and deletes cookie.
 * @param c Hono context.
 */
export const logout = async (c: Context): Promise<void> => {
    const sessionToken =
        cookies().get(SESSION_COOKIE.COOKIE_NAME)?.value ?? null;
    if (!sessionToken) throw new Error('Not authenticated');

    deleteSessionTokenCookie(c);
    deleteSessionUserCookie(c);

    if (sessionToken) {
        await invalidateSession(sessionToken);
    }
};
