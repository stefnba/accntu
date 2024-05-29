import { Hono } from 'hono';

import s3Upload from './s3/api';

const app = new Hono().route('/s3', s3Upload);

export default app;
