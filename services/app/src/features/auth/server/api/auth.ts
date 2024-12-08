import { logout } from '@features/auth/server/hono/actions/authenticate';
import { Hono } from 'hono';

const app = new Hono().post('/logout', async (c) => {
    await logout(c);
    return c.json({ success: true }, 201);
});

export default app;
