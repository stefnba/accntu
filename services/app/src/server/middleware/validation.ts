import { createMiddleware } from 'hono/factory';

/**
 * Middleware to handle validation errors
 */
export const validationError = createMiddleware(async (c, next) => {
    await next();

    if (c.res.status === 400) {
        const res = await c.res.json();
        if ('success' in res && 'error' in res && res.success === false) {
            const firstIssue = res.error?.issues[0];

            // todo log and create custom Validation error

            c.res = c.json(
                {
                    error: 'Validation error',
                    detail: firstIssue?.message || 'Unknown error',
                    path: firstIssue?.path || 'Unknown path'
                },
                400
            );
        }
    }
});
