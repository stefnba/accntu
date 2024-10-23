import { createMiddleware } from 'hono/factory';
import type { StatusCode } from 'hono/utils/http-status';

/**
 * Middleware to handle validation errors
 */
export const validationError = createMiddleware(async (c, next) => {
    await next();

    // if status is not 400 or above, skip
    if (c.res.status < 400) {
        return;
    }
    return;

    const status = c.res.status as StatusCode;
    const res = await c.res.json();

    if (
        typeof res === 'object' &&
        'success' in res &&
        'error' in res &&
        res.success === false
    ) {
        const firstIssue = res.error?.issues[0];
        // build new response
        c.res = c.json(
            {
                error: 'Validation Error',
                detail: firstIssue?.message || 'Unknown error',
                path: firstIssue?.path || 'Unknown path'
            },
            400
        );
        return;
    } // return;

    // todo logging

    // build new response
    c.res = c.json(res, status);
});
