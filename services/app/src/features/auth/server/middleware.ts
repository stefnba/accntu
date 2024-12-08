import { cookies } from 'next/headers';

import { logout } from '@features/auth/server/hono/actions/authenticate';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';

import { validateSessionToken } from './actions/session';
import { PUBLIC_API_ROUTES, SESSION_COOKIE } from './config';
import { isUrlMatch } from './utils';

/**
 * Hono middleware for handling auth requests..
 */
export const authMiddleware = createMiddleware(async (c, next) => {
    const { path } = c.req;

    // Skip auth for public routes
    if (isUrlMatch(path, PUBLIC_API_ROUTES)) {
        return next();
    }

    const sessionToken =
        cookies().get(SESSION_COOKIE.COOKIE_NAME)?.value ?? null;

    if (!sessionToken) {
        return c.text('Unauthorized', 401);
    }
    const { session, user } = await validateSessionToken(sessionToken);

    // todo
    // if (session && session.fresh) {
    //     c.header(
    //         'Set-Cookie',
    //         lucia.createSessionCookie(session.id).serialize(),
    //         {
    //             append: true
    //         }
    //     );
    // }

    if (!session) {
        logout(c);
        return c.text('Unauthorized', 401);
    }

    // Set user and session on the context
    c.set('user', user);
    c.set('session', session);

    return next();
});
