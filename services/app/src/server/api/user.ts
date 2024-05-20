import { UpdateUserSchema } from '@/features/user/schema/update-user';
import { getUser } from '@/server/auth/validate';
import { zValidator } from '@hono/zod-validator';
import { findUser, updateUser } from '@server/services/user';
import { Hono } from 'hono';
import { z } from 'zod';

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
        return c.json(data);
    });

export default app;
