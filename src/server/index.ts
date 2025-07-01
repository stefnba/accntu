import { authMiddleware } from '@/lib/auth';
import { AuthContext } from '@/lib/auth/server/types';
import { appEndpoints } from '@/server/endpoints';
import { handleGlobalError } from '@/server/lib/error/handler';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { timing } from 'hono/timing';

// Extend Hono's Context type to include our user
declare module 'hono' {
    interface ContextVariableMap {
        user: AuthContext['user'];
        session: AuthContext['session'];
    }
}

const app = new Hono<{ Variables: AuthContext }>().basePath('/api');

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
    .route('/admin', appEndpoints.admin)
    .route('/banks', appEndpoints.banks)
    .route('/labels', appEndpoints.labels)
    .route('/tags', appEndpoints.tags)
    .route('/user', appEndpoints.user)
    .route('/auth', appEndpoints.auth)
    .route('/transactions', appEndpoints.transactions)
    .route('/transaction-import', appEndpoints.transactionImport);

export type AppType = typeof routes;
export { app, routes };
