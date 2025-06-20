import cloudUploadEndpoints from '@/lib/upload/cloud/endpoints';
import localUploadEndpoints from '@/lib/upload/local/endpoints';
import { Hono } from 'hono';

const app = new Hono().route('/cloud', cloudUploadEndpoints).route('/local', localUploadEndpoints);

export default app;
