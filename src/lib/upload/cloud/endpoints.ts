import { Hono } from 'hono';

import s3UploadEndpoints from '@/lib/upload/cloud/s3/endpoints';

const app = new Hono().route('/s3', s3UploadEndpoints);

export default app;
