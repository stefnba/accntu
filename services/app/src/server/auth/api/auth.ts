import { invalidateSession } from '@auth/authenticate';
import { Hono } from 'hono';

const app = new Hono().post('/logout', async (c) => {
    await invalidateSession(c);
    return c.json({ success: true }, 201);
});

export default app;
