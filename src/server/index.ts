import { Hono } from 'hono';

import userRoutes from '@/server/features/user/routes';
// export const runtime = 'edge';

const app = new Hono().basePath('/api');

const routes = app.route('/user', userRoutes);

export type AppType = typeof routes;
export { app };
