import { AuthContext } from '@/lib/auth/server/types';
import { validateAndSetAuthContext, validateRolePermission } from '@/lib/auth/server/validate';
import { Context, Next } from 'hono';
import { isMethodPathMatch, isPathMatch } from '../utils';
import { METHOD_PUBLIC_API_ROUTES, PUBLIC_API_ROUTES } from './config';

/**
 * Global auth middleware that protects all routes except those in PUBLIC_API_ROUTES
 * This middleware:
 * 1. Checks if the route is public (no auth required)
 * 2. Validates the session cookie
 * 3. Sets the user on the context
 * 4. Checks role-based permissions
 */
export const authMiddleware = async (
    c: Context<{
        Variables: AuthContext;
    }>,
    next: Next
) => {
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
    const { user, session } = await validateAndSetAuthContext(c);

    // Check role-based access
    await validateRolePermission(user, path);

    // Continue to the next middleware or route handler
    await next();
};
