import { getUser } from '@/server/auth/validate';
import { zValidator } from '@hono/zod-validator';
import { findUser } from '@server/services/user';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono().get('/me', async (c) => {
    const user = getUser(c);
    const data = await findUser(user.id);
    return c.json(data);
});

export default app;
