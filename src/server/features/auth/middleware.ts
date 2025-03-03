import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { clearSessionCookie, getSessionFromCookie, validateSession } from './services';

/**
 * Middleware to require authentication for protected routes
 * Adds the user object to the context if authenticated
 */
export const requireAuth = async (c: Context, next: Next) => {
    try {
        // Log request details
        console.log('Auth middleware - Request path:', c.req.path);
        console.log('Auth middleware - Headers:', {
            cookie: c.req.header('cookie'),
            origin: c.req.header('origin'),
            referer: c.req.header('referer'),
        });

        // Get session ID from cookie
        const sessionId = getSessionFromCookie(c);
        console.log('Auth middleware - Session ID:', sessionId);

        if (!sessionId) {
            console.log('Auth middleware - No session ID found in cookie');
            throw new HTTPException(401, {
                message: 'No session found',
            });
        }

        // Validate session
        const user = await validateSession(sessionId);
        console.log('Auth middleware - Session validation result:', {
            hasUser: !!user,
            userId: user?.id,
        });

        if (!user) {
            console.log('Auth middleware - Invalid or expired session');
            clearSessionCookie(c);
            throw new HTTPException(401, {
                message: 'Session expired',
            });
        }

        // Add user to context
        c.set('user', user);
        console.log('Auth middleware - User set in context:', {
            userId: user.id,
            email: user.email,
        });

        // Continue to the next middleware or route handler
        await next();
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
};

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
