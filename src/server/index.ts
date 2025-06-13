import userEndpoints from '@/features/user/server/endpoints';
import { authEndpoints, authMiddleware, type TSession, type TUser } from '@/lib/auth';
import statusEndpoints from '@/server/endpoints';
import { logger } from 'hono/logger';

import { handleGlobalError } from '@/server/lib/error/handler';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { timing } from 'hono/timing';

// Extend Hono's Context type to include our user
declare module 'hono' {
    interface ContextVariableMap {
        user: TUser | null;
        session: TSession | null;
    }
}

const app = new Hono<{
    Variables: {
        user: TUser | null;
        session: TSession | null;
    };
}>().basePath('/api');

app.use('*', timing());
app.use('*', logger());
app.use('*', timing());
app.use('*', cors());
app.use('*', authMiddleware);

// Use Hono's onError hook with our error handler
app.onError(handleGlobalError);

// Routes
const routes = app
    .route('/user', userEndpoints)
    .route('/auth', authEndpoints)
    .route('/status', statusEndpoints);

export type AppType = typeof routes;
export { app, routes };
