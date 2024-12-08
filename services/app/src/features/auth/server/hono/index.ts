import { User } from '@features/user/schema/get-user';
import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

/**
 * Get the user object from the Hono context.
 * @param c Hono context.
 * @returns User object.
 */
export const getUser = (c: Context): User => {
    const user = c.get('user');

    if (!user) {
        throw new HTTPException(401, { message: 'Unauthorized' });
    }

    return user;
};
