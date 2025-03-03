import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { timing } from 'hono/timing';

import { TUser } from '@/server/db/schemas';
import authRoutes from '@/server/features/auth/routes';
import { Session } from '@/server/features/auth/schemas';
import userRoutes from '@/server/features/user/routes';

const app = new Hono<{
    Variables: {
        // Extend Hono's Context type to include our user
        user: TUser | null;
        session: Session | null;
    };
}>().basePath('/api');

// app.use('*', logger());
app.use('*', timing());
app.use('*', cors());

// Global error handler
app.onError((err, c) => {
    console.error('Application error:', err);

    if (err instanceof HTTPException) {
        return err.getResponse();
    }

    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return c.json({ error: message }, 500);
});

const routes = app.route('/user', userRoutes).route('/auth', authRoutes);

export type AppType = typeof routes;
export { app };
