import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';

import { PUBLIC_API_ROUTES } from './config';
import { lucia } from './lucia';
import { isUrlMatch } from './utils';

export const authMiddleware = createMiddleware(async (c, next) => {
    const { path } = c.req;

    // Skip auth for public routes
    if (isUrlMatch(path, PUBLIC_API_ROUTES)) {
        return next();
    }

    const sessionId = getCookie(c, lucia.sessionCookieName) ?? null;

    if (!sessionId) {
        return c.text('Unauthorized', 401);
    }
    const { session, user } = await lucia.validateSession(sessionId);

    if (session && session.fresh) {
        c.header(
            'Set-Cookie',
            lucia.createSessionCookie(session.id).serialize(),
            {
                append: true
            }
        );
    }

    if (!session) {
        console.log('No session found');
        c.header('Set-Cookie', lucia.createBlankSessionCookie().serialize(), {
            append: true
        });
        return c.text('Unauthorized', 401);
    }

    // Set user and session on the context
    c.set('user', user);
    c.set('session', session);

    return next();
});
