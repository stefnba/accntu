import { type TSession, type TUser } from '@/lib/auth';
import { validateAndSetAuthContext } from '@/lib/auth/server/validate';
import { Context, Next } from 'hono';
import { isMethodPathMatch, isPathMatch } from '../utils';
import { METHOD_PUBLIC_API_ROUTES, PUBLIC_API_ROUTES } from './config';

/**
 * Define the auth context type
 */
export interface AuthContext {
    Variables: {
        user: TUser | null;
        session: TSession | null;
    };
}

/**
 * Global auth middleware that protects all routes except those in PUBLIC_API_ROUTES
 * This middleware:
 * 1. Checks if the route is public (no auth required)
 * 2. Validates the session cookie
 * 3. Sets the user on the context
 * 4. Checks role-based permissions
 */
export const authMiddleware = async (c: Context<AuthContext>, next: Next) => {
    const path = c.req.path;
    const method = c.req.method;

    // Skip auth for public routes (path only)
    if (isPathMatch(path, PUBLIC_API_ROUTES)) {
        return next();
    }

    // Skip auth for public routes (method + path)
    if (isMethodPathMatch(method, path, METHOD_PUBLIC_API_ROUTES)) {
        return next();
    }

    // set user and session in Hono context
    await validateAndSetAuthContext(c);

    // Continue to the next middleware or route handler
    await next();
};
