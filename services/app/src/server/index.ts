import {
    authRouter,
    bankRouter,
    connectedRouter,
    importRouter,
    labelRouter,
    tagRouter,
    transactionRouter,
    userRouter
} from '@server/api';
import { AuthError } from '@server/auth/error';
import { authMiddleware } from '@server/auth/middleware';
import upload from '@server/lib/upload/api';
import { logger } from '@server/middleware/logging';
import { validationError } from '@server/middleware/validation';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { HTTPException } from 'hono/http-exception';
// import { logger } from 'hono/logger';
import { Session, User } from 'lucia';

// export const runtime = 'edge';

const app = new Hono<{
    Variables: {
        user: User | null;
        session: Session | null;
    };
}>().basePath('/api');

app.use(logger);
app.use(validationError);

app.use(logger);
app.onError(async (err, c) => {
    // todo logging

    // console.log('Error', err);

    if (err instanceof HTTPException) {
        const res = err.getResponse();
        console.log('HTTPException');
        console.log('HTTPException', await res.json());
        return c.json({ error: err.message }, err.status);
        // const json = await res.json();
        // console.log('HTTPException', json);
        // return c.json(res.body, err.status);
        // // return c.json({ error: err.message }, err.status);
    }
    if (err instanceof AuthError) {
        return c.json({ error: err.message }, 401);
    }
    return c.json(
        {
            error: '1Internal error'
        },
        500
    );
});
app.use(csrf());
app.use(
    cors({
        origin: [
            'http://localhost:3000',
            'https://github.com',
            'https://accntu.com'
        ]
    })
);
app.use(authMiddleware);
app.notFound((c) => c.text('Not Found', 404));

const routes = app
    .route('/auth', authRouter)
    .route('/transactions', transactionRouter)
    .route('/labels', labelRouter)
    .route('/banks', bankRouter)
    .route('/connected', connectedRouter)
    .route('/user', userRouter)
    .route('/import', importRouter)
    .route('/upload', upload)
    .route('/tags', tagRouter);

export type AppType = typeof routes;
export default app;
