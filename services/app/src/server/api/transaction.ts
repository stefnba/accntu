import { CreateTransactionsSchema } from '@/features/transaction/schema/create-transactions';
import { GetTransactionByIdSchema } from '@/features/transaction/schema/get-transaction';
import { ListTransactionSchema } from '@/features/transaction/schema/get-transactions';
import {
    createTransactions,
    listTransactions
} from '@/server/actions/transaction';
import { getUser } from '@/server/auth';
import { db } from '@/server/db/client';
import { InsertTransactionSchema } from '@db/schema';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
    .get('/', zValidator('query', ListTransactionSchema), async (c) => {
        const user = getUser(c);
        const queryParams = c.req.valid('query');

        const data = await listTransactions(queryParams, user.id);

        return c.json(data);
    })
    .post(
        '/create',
        zValidator('json', CreateTransactionsSchema),
        async (c) => {
            const user = getUser(c);
            const { values, accountId, importId } = c.req.valid('json');

            const data = await createTransactions(
                values,
                importId,
                accountId,
                user.id
            );

            return c.json(data, 201);
        }
    )
    .get('/:id', zValidator('param', GetTransactionByIdSchema), async (c) => {
        const { id } = c.req.valid('param');
        const user = getUser(c);

        const data = await db.query.transaction.findFirst({
            where: (fields, { and, eq }) =>
                and(eq(fields.id, id), eq(fields.userId, user.id)),
            with: {
                label: true
            }
        });

        if (!data) {
            return c.json({ error: 'Not Found' }, 404);
        }

        return c.json(data);
    });

export default app;
