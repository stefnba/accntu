import { db } from '@/server/db';
import { withDbQuery, withQueryRoute } from '@/server/lib/handler';
import { sql } from 'drizzle-orm';
import { Hono } from 'hono';

// App endpoints
import bankEndpoints from '@/features/bank/server/endpoints';
import labelEndpoints from '@/features/label/server/endpoints';
import tagEndpoints from '@/features/tag/server/endpoints';
import transactionImportEndpoints from '@/features/transaction-import/server/endpoints';
import userEndpoints from '@/features/user/server/endpoints';
import authEndpoints from '@/lib/auth/server/endpoints';
import uploadEndpoints from '@/lib/upload/endpoints';

// Status endpoints
const statusEndpoints = new Hono().get('/', async (c) =>
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

export const appEndpoints = {
    status: statusEndpoints,
    banks: bankEndpoints,
    labels: labelEndpoints,
    tags: tagEndpoints,
    transactionImport: transactionImportEndpoints,
    user: userEndpoints,
    auth: authEndpoints,
    upload: uploadEndpoints,
};
