import { db } from '@/db/client';
import { GetTransactionByIdSchema } from '@/features/transaction/schema/get-transaction';
import { getUser } from '@/server/auth/validate';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
    .get('/', (c) => {
        return c.json({ data: 'list authors' });
    })
    .post(
        '/create',
        zValidator(
            'json',
            z.object({
                name: z.string()
            })
        ),
        async (c) => {
            return c.json(
                {
                    data: 'create author'
                },
                201
            );
        }
    )
    .get('/:id', zValidator('param', GetTransactionByIdSchema), async (c) => {
        const { id } = c.req.valid('param');
        const user = getUser(c);

        const data = await db.query.label.findFirst({
            where: (fields, { and, eq }) =>
                and(eq(fields.id, id), eq(fields.userId, user.id))
        });

        if (!data) {
            return c.json({ error: 'Not Found' }, 404);
        }

        return c.json(data);
    });

export default app;
