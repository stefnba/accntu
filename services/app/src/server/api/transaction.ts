import { GetTransactionByIdSchema } from '@/features/transaction/schema/get-transaction';
import { db } from '@/server/db/client';
import { zValidator } from '@hono/zod-validator';
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
    .post('/create', (c) => {
        return c.json('create an author', 201);
    })
    .get('/:id', zValidator('param', GetTransactionByIdSchema), async (c) => {
        const { id } = c.req.valid('param');
        const user = getUser(c);

        const data = await db.query.transaction.findFirst({
            where: (fields, { and, eq }) =>
                and(eq(fields.id, id), eq(fields.userId, user.id))
        });

        if (!data) {
            return c.json({ error: 'Not Found' }, 404);
        }

        return c.json(data);
    });

export default app;
