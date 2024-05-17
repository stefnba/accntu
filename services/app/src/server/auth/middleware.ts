import { lucia } from '@/lib/auth/lucia';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';

const PUBLIC_ROUTES = ['/auth/login', '/auth/register'];

export const authMiddleware = createMiddleware(async (c, next) => {
    // Skip auth for public routes
    if (PUBLIC_ROUTES.includes(c.req.path)) {
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
