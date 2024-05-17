import bank from '@/server/api/bank';
import connected from '@/server/api/connected';
import label from '@/server/api/label';
import transaction from '@/server/api/transaction';
import user from '@/server/api/user';
import auth from '@/server/auth/api';
import { authMiddleware } from '@/server/auth/middleware';
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
    .route('/transactions', transaction)
    .route('/labels', label)
    .route('/banks', bank)
    .route('/connected', connected)
    .route('/user', user);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);

export type AppType = typeof routes;
