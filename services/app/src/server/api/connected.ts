import { Hono } from 'hono';

import connectedAccount from './connectedAccount';
import connectedBank from './connectedBank';

const app = new Hono()
    .route('/banks', connectedBank)
    .route('/accounts', connectedAccount);

export default app;
