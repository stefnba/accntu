import { Context, Next } from 'hono';
import { clearSessionCookie, getSessionFromCookie, validateSession } from './services';

/**
 * Middleware to require authentication for protected routes
 * Adds the user object to the context if authenticated
 */
export const requireAuth = async (c: Context, next: Next) => {
    try {
        // Get session ID from cookie
        const sessionId = getSessionFromCookie(c);

        if (!sessionId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        // Validate session
        const user = await validateSession(sessionId);

        if (!user) {
            clearSessionCookie(c);
            return c.json({ error: 'Invalid session' }, 401);
        }

        // Add user to context
        c.set('user', user);

        // Continue to the next middleware or route handler
        await next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return c.json({ error: 'Authentication error' }, 500);
    }
};
