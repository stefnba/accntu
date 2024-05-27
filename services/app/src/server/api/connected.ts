import { Hono } from 'hono';

import connectedAccount from './connected-account';
import connectedBank from './connected-bank';

const app = new Hono()
    .route('/banks', connectedBank)
    .route('/accounts', connectedAccount);

export default app;
