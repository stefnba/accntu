import { handleZodError } from '@/server/lib/error/handler';
import { zValidator as zv } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import { ZodType } from 'zod';

/**
 * Centralized Zod validator that throws a ZodError when validation fails and hence falls back to our custom error handler
 *
 * This is used to validate the request body, query, cookie and params in the routes
 */
export const zValidator = <T extends ZodType, Target extends keyof ValidationTargets>(
    target: Target,
    schema: T
) =>
    zv(target, schema, (result) => {
        if (!result.success) {
            // convert and forward the error to our custom error handler
            throw handleZodError(result.error);
            // throw new ZodError(result.error.issues);
        }
    });
