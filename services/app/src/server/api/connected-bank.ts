import { db } from '@/db/client';
import { getUser } from '@/server/auth';
import { zValidator } from '@hono/zod-validator';
import { createConnectedBank } from '@server/services/connectedBank';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { connectedBank } from '../db/schema';

export const CreateConnectedBankSchema = z.object({
    bankId: z.string(),
    accounts: z
        .array(z.object({ value: z.string(), include: z.boolean() }))
        .transform((val) => val.filter((v) => v.include).map((v) => v.value))
});

const app = new Hono()
    .get('/', async (c) => {
        const user = getUser(c);
        const data = await db.query.connectedBank.findMany({
            where: (fields, { eq, and }) => and(eq(fields.userId, user.id)),
            with: {
                bank: true,
                accounts: true
            }
        });
        return c.json(data);
    })
    .post(
        '/create',
        zValidator('json', CreateConnectedBankSchema),
        async (c) => {
            const values = c.req.valid('json');
            const user = getUser(c);
            const data = await createConnectedBank(user.id, values);
            return c.json(data, 201);
        }
    )
    .delete(
        '/:id',
        zValidator('param', z.object({ id: z.string() })),
        async (c) => {
            const { id } = c.req.valid('param');
            const user = getUser(c);

            const [data] = await db
                .delete(connectedBank)
                .where(
                    and(
                        eq(connectedBank.id, id),
                        eq(connectedBank.userId, user.id)
                    )
                )
                .returning({ id: connectedBank.id });

            return c.json(data, 201);
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

            const data = await db.query.connectedBank.findFirst({
                where: (fields, { and, eq }) =>
                    and(eq(fields.id, id), eq(fields.userId, user.id)),
                with: {
                    bank: true,
                    accounts: true
                }
            });

            if (!data) {
                return c.json({ error: 'Not Found' }, 404);
            }

            return c.json(data);
        }
    );

export default app;
