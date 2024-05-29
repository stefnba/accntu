import { CreateTransactionsSchema } from '@/features/transaction/schema/create-transactions';
import { GetTransactionByIdSchema } from '@/features/transaction/schema/get-transaction';
import { db } from '@/server/db/client';
import { InsertTransactionSchema } from '@db/schema';
import { zValidator } from '@hono/zod-validator';
import { createTransactions } from '@server/services/transaction';
import { Hono } from 'hono';
import { z } from 'zod';

import { getUser } from '../auth/validate';

const app = new Hono()
    .get(
        '/',
        zValidator(
            'query',
            z.object({
                page: z.coerce.number().optional(),
                pageSize: z.coerce.number().optional()
            })
        ),
        async (c) => {
            const a = await db.query.bank.findMany();

            return c.json({
                data: a
            });
        }
    )
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
