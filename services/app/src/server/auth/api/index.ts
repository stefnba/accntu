import { Hono } from 'hono';

import authRouter from './auth';
import emailRouter from './email';
import oauthRouter from './oauth';

const app = new Hono()
    .route('/', authRouter)
    .route('/oauth', oauthRouter)
    .route('/email', emailRouter);

export default app;
