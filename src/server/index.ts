import userEndpoints from '@/features/user/server/endpoints';
import { TUser } from '@/server/db/schemas';
import { globalAuthMiddleware } from '@/server/features/auth/middleware';
import authRoutes from '@/server/features/auth/routes';
import { logger } from 'hono/logger';

import { handleError } from '@/server/lib/error/handler';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { timing } from 'hono/timing';

// Extend Hono's Context type to include our user
declare module 'hono' {
    interface ContextVariableMap {
        user: TUser;
    }
}

const app = new Hono<{
    Variables: {
        user: TUser;
    };
}>().basePath('/api');

app.use('*', timing());
app.use('*', logger());
app.use('*', timing());
app.use('*', cors());
app.use('*', globalAuthMiddleware);

// Use Hono's onError hook with our error handler
app.onError(handleError);

// Routes
const routes = app.route('/user', userEndpoints).route('/auth', authRoutes);

export type AppType = typeof routes;
export { app, routes };
