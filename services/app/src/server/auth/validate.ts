import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { User } from 'lucia';

export const getUser = (c: Context): User => {
    const user = c.get('user');

    if (!user) {
        throw new HTTPException(401, { message: 'Custom error message' });
    }

    return user;
};
