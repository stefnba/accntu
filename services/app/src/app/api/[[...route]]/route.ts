import {
    bankRouter,
    connectedRouter,
    importRouter,
    labelRouter,
    transactionRouter
} from '@/server/api';
import user from '@/server/api/user';
import auth from '@/server/auth/api';
import { authMiddleware } from '@/server/auth/middleware';
import upload from '@/server/lib/upload/api';
import { logger } from '@/server/middleware/logging';
import { Hono } from 'hono';
import { csrf } from 'hono/csrf';
import { HTTPException } from 'hono/http-exception';
import { handle } from 'hono/vercel';
import { Session, User } from 'lucia';

// export const runtime = 'edge';

const app = new Hono<{
    Variables: {
        user: User | null;
        session: Session | null;
    };
}>().basePath('/api');

app.use(logger);
app.onError((err, c) => {
    // todo logging
    console.error(err);

    if (err instanceof HTTPException) {
        return err.getResponse();
    }
    return c.json({ error: 'Internal error' }, 500);
});
app.use(csrf());
app.use(authMiddleware);
app.notFound((c) => c.text('Not Found', 404));

const routes = app
    .route('/auth', auth)
    .route('/transactions', transactionRouter)
    .route('/labels', labelRouter)
    .route('/banks', bankRouter)
    .route('/connected', connectedRouter)
    .route('/user', user)
    .route('/import', importRouter)
    .route('/upload', upload);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
