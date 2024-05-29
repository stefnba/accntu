import { Hono } from 'hono';

import cloudUpload from './cloud/api';

const app = new Hono().route('/cloud', cloudUpload);

export default app;
