import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import { timing } from 'hono/timing';

import userRoutes from '@/server/features/user/routes';
// export const runtime = 'edge';

const app = new Hono().basePath('/api');

app.use('*', logger());
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

const routes = app.route('/user', userRoutes);

export type AppType = typeof routes;
export { app };
