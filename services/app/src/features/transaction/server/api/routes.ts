import { db } from '@db';
import { transaction } from '@db/schema';
import { getUser } from '@features/auth/server/hono';
import { AddTagToTransactionSchema } from '@features/tag/schema';
import { addTagToTransaction } from '@features/tag/server/actions';
import {
    CreateTransactionsSchema,
    GetTransactionByIdSchema,
    ListTransactionSchema,
    TransactionFilterKeysSchema,
    UpdateTransactionSchema,
    UpdateTransactionsSchema
} from '@features/transaction/schema';
import {
    createTransactions,
    getTransactionById,
    listTransactions
} from '@features/transaction/server/actions';
import { listFilterOptions } from '@features/transaction/server/actions';
import { zValidator } from '@hono/zod-validator';
import { and, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
    .get('/', zValidator('query', ListTransactionSchema), async (c) => {
        const user = getUser(c);
        const { page, pageSize, orderBy, ...filters } = c.req.valid('query');

        const data = await listTransactions({
            userId: user.id,
            filters,
            pagination: {
                page: page,
                pageSize: pageSize
            }
        });

        return c.json(data);
    })
    .patch('/', zValidator('json', UpdateTransactionsSchema), async (c) => {
        const user = getUser(c);
        const { ids, values } = c.req.valid('json');

        const updatedRecords = await db
            .update(transaction)
            .set({ ...values, updatedAt: new Date() })
            .where(
                and(
                    inArray(transaction.id, ids),
                    eq(transaction.userId, user.id)
                )
            )
            .returning();

        return c.json(updatedRecords, 201);
    })
    .get(
        '/filters/:filterKey',
        zValidator(
            'param',
            z.object({ filterKey: TransactionFilterKeysSchema })
        ),
        zValidator('query', ListTransactionSchema),
        async (c) => {
            const user = getUser(c);
            const { filterKey } = c.req.valid('param');
            const { page, pageSize, orderBy, ...filters } =
                c.req.valid('query');

            const data = await listFilterOptions({
                userId: user.id,
                filterKey,
                filters
            });

            return c.json(data);
        }
    )
    .post(
        '/create',
        zValidator('json', CreateTransactionsSchema),
        async (c) => {
            const user = getUser(c);
            const { values, accountId, importFileId } = c.req.valid('json');

            const data = await createTransactions({
                values,
                accountId,
                importFileId,
                userId: user.id
            });

            return c.json(data, 201);
        }
    )
    .post(
        '/:transactionId/tag',
        zValidator('param', GetTransactionByIdSchema),
        zValidator(
            'json',
            AddTagToTransactionSchema.pick({ tagId: true, name: true })
        ),
        async (c) => {
            const user = getUser(c);
            const { transactionId } = c.req.valid('param');
            const { tagId, name } = c.req.valid('json');

            const data = await addTagToTransaction({
                userId: user.id,
                transactionId,
                tagId,
                name
            });

            return c.json(data, 201);
        }
    )
    .get(
        '/:transactionId',
        zValidator('param', GetTransactionByIdSchema),
        async (c) => {
            const { transactionId } = c.req.valid('param');
            const user = getUser(c);

            const data = await getTransactionById({
                transactionId,
                userId: user.id
            });

            if (!data) {
                return c.json({ error: 'Not Found' }, 404);
            }

            return c.json(data);
        }
    )
    .patch(
        '/:transactionId/update',
        zValidator('json', UpdateTransactionSchema),
        zValidator('param', GetTransactionByIdSchema),
        async (c) => {
            const user = getUser(c);
            const values = c.req.valid('json');
            const { transactionId } = c.req.valid('param');

            const [updatedRecord] = await db
                .update(transaction)
                .set({ ...values, updatedAt: new Date() })
                .where(
                    and(
                        eq(transaction.id, transactionId),
                        eq(transaction.userId, user.id)
                    )
                )
                .returning();

            return c.json(updatedRecord, 201);
        }
    );

export default app;
