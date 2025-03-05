import { validateSession } from '@/server/features/auth/services/session';
import { clearCookie, getCookieValue } from '@/server/lib/cookies';
import { Context, Next } from 'hono';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

/**
 * Middleware to require authentication for protected routes
 * Adds the user object to the context if authenticated
 */
export const requireAuth = createMiddleware(async (c: Context, next: Next) => {
    try {
        // Log request details
        console.log('Auth middleware - Request path:', c.req.path);
        console.log('Auth middleware - Headers:', {
            cookie: c.req.header('cookie'),
            origin: c.req.header('origin'),
            referer: c.req.header('referer'),
        });

        // Get session ID from cookie
        const sessionId = getCookieValue(c, 'AUTH_SESSION');

        if (!sessionId) {
            console.log('Auth middleware - No session ID found in cookie');
            throw new HTTPException(401, {
                message: 'No session found',
            });
        }

        // Validate session and get user
        try {
            const user = await validateSession(sessionId);
            c.set('user', user);
            // Continue to the next middleware or route handler
            await next();
        } catch (error) {
            clearCookie(c, 'AUTH_SESSION');
            throw error;
        }
    } catch (error) {
        console.error('Auth middleware error:', {
            error,
            path: c.req.path,
            method: c.req.method,
            headers: {
                cookie: c.req.header('cookie'),
                origin: c.req.header('origin'),
                referer: c.req.header('referer'),
            },
        });

        if (error instanceof HTTPException) throw error;

        throw new HTTPException(500, {
            message: 'Internal error',
        });
    }
});

/**
 * Middleware to require admin role
 * Must be used after requireAuth middleware
 */
export const requireAdmin = async (c: Context, next: Next) => {
    const user = c.get('user');

    if (user.role !== 'admin') {
        throw new HTTPException(403, { message: 'Forbidden' });
    }

    await next();
};
