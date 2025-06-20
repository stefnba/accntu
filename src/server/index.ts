import { authMiddleware, type TSession, type TUser } from '@/lib/auth';
import { appEndpoints } from '@/server/endpoints';
import { handleGlobalError } from '@/server/lib/error/handler';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
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
    .route('/status', appEndpoints.status)
    .route('/banks', appEndpoints.banks)
    .route('/labels', appEndpoints.labels)
    .route('/tags', appEndpoints.tags)
    .route('/user', appEndpoints.user)
    .route('/auth', appEndpoints.auth)
    .route('/transaction-import', appEndpoints.transactionImport)
    .route('/upload', appEndpoints.upload);

export type AppType = typeof routes;
export { app, routes };
