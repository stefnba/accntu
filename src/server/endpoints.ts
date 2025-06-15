import { db } from '@/server/db';
import { withDbQuery, withQueryRoute } from '@/server/lib/handler';
import { sql } from 'drizzle-orm';
import { Hono } from 'hono';

const app = new Hono().get('/', async (c) =>
    withQueryRoute(c, async () => {
        const result = await withDbQuery({
            queryFn: async () => db.execute(sql`SELECT 1`),
            operation: 'test database connection',
        });
        if (process.env.NODE_ENV === 'development') {
            return { server: 'running', database: result ? 'connected' : 'disconnected' };
        }
        return { server: 'running' };
    })
);

export default app;
