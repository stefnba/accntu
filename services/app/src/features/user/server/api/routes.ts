import { UpdateUserSchema } from '@/features/user/schema/update-user';
import { getUser } from '@features/auth/server';
import { SESSION_USER } from '@features/auth/server/config';
import { findUser, updateUser } from '@features/user/server/actions';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';

const app = new Hono()
    .get('/me', async (c) => {
        const user = getUser(c);
        const data = await findUser(user.id);
        return c.json(data);
    })
    .patch('/update', zValidator('json', UpdateUserSchema), async (c) => {
        const user = getUser(c);
        const values = c.req.valid('json');

        const data = await updateUser(user.id, values);

        setCookie(c, SESSION_USER.COOKIE_NAME, JSON.stringify(data));

        return c.json(data);
    });

export default app;
