import { db } from '@/server/db';
import { withDbQuery, withQueryRoute } from '@/server/lib/handler';
import { sql } from 'drizzle-orm';
import { Hono } from 'hono';

// App endpoints
import adminEndpoints from '@/features/admin/server/endpoints';
import bankEndpoints from '@/features/bank/server/endpoints';
import bucketEndpoints from '@/features/bucket/server/endpoints';
import budgetEndpoints from '@/features/budget/server/endpoints';
import labelEndpoints from '@/features/label/server/endpoints';
import participantEndpoints from '@/features/participant/server/endpoints';
import tagEndpoints from '@/features/tag/server/endpoints';
import transactionFxEndpoints from '@/features/transaction-fx/server/endpoints';
import transactionImportEndpoints from '@/features/transaction-import/server/endpoints';
import transactionEndpoints from '@/features/transaction/server/endpoints';
import userEndpoints from '@/features/user/server/endpoints';
import authEndpoints from '@/lib/auth/server/endpoints';

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
    admin: adminEndpoints,
    banks: bankEndpoints,
    budgets: budgetEndpoints,
    labels: labelEndpoints,
    participants: participantEndpoints,
    tags: tagEndpoints,
    transactions: transactionEndpoints,
    transactionImport: transactionImportEndpoints,
    transactionFx: transactionFxEndpoints,
    user: userEndpoints,
    auth: authEndpoints,
    buckets: bucketEndpoints,
};
