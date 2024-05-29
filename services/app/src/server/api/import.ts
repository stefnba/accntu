import { getUser } from '@/server/auth/validate';
import { db } from '@db';
import { InsertTransactionImportSchema, transactionImport } from '@db/schema';
import { zValidator } from '@hono/zod-validator';
import { createId } from '@paralleldrive/cuid2';
import { deleteImport } from '@server/services/import';
import { Hono } from 'hono';
import { z } from 'zod';

import importFile from './import-file';

const app = new Hono()
    .route('/file', importFile)
    .get('/', async (c) => {
        const user = getUser(c);
        const data = await db.query.transactionImport.findMany({
            where: (fields, { eq, and }) => and(eq(fields.userId, user.id)),
            with: {
                files: true
            }
        });
        return c.json(data);
    })
    .post(
        '/create',
        zValidator(
            'json',
            InsertTransactionImportSchema.pick({ accountId: true })
        ),
        async (c) => {
            const values = c.req.valid('json');
            const user = getUser(c);

            const [data] = await db
                .insert(transactionImport)
                .values({
                    ...values,
                    id: createId(),
                    userId: user.id
                })
                .returning();

            return c.json(data, 201);
        }
    )
    .get(
        '/:id/preview/:fileId',
        zValidator(
            'param',
            z.object({
                id: z.string(),
                fileId: z.string()
            })
        ),
        async (c) => {
            const { id: importId, fileId } = c.req.valid('param');
            const user = getUser(c);

            return c.json([
                {
                    title: 'ddadsf',
                    date: '2021-01-01',
                    amount: 100,
                    key: 'dkadslkf'
                },
                {
                    title: 'ddadsf',
                    date: '2021-01-01',
                    amount: 100,
                    key: 'dkadslkf'
                },
                {
                    title: 'ddadsf',
                    date: '2021-01-01',
                    amount: 100,
                    key: 'dkadslkf'
                },
                {
                    title: 'ddadsf',
                    date: '2021-01-01',
                    amount: 100,
                    key: 'dkadslkf'
                },
                {
                    title: 'ddadsf',
                    date: '2021-01-01',
                    amount: 100,
                    key: 'dkadslkf'
                }
            ]);
        }
    )
    .get(
        '/:id',
        zValidator(
            'param',
            z.object({
                id: z.string()
            })
        ),
        async (c) => {
            const { id } = c.req.valid('param');
            const user = getUser(c);

            const data = await db.query.transactionImport.findFirst({
                where: (fields, { eq, and }) =>
                    and(eq(fields.id, id), eq(fields.userId, user.id)),
                with: {
                    files: true
                }
            });

            if (!data) {
                return c.json({ error: 'Not Found' }, 404);
            }

            return c.json(data);
        }
    )
    .delete(
        '/:id',
        zValidator('param', z.object({ id: z.string() })),
        async (c) => {
            const { id } = c.req.valid('param');
            const user = getUser(c);

            const data = await deleteImport(id, user.id);

            return c.json(data, 201);
        }
    );

export default app;
