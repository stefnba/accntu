import {
    createConnectedAccounts,
    getConnectedAccount,
    getConnectedAccounts
} from '@/server/actions/connected-account';
import { InsertConnectedAccountSchema } from '@db/schema';
import { getUser } from '@features/auth/server';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
    .get('/', async (c) => {
        const user = getUser(c);
        const data = await getConnectedAccounts(user.id);
        return c.json(data);
    })
    .get(
        '/:id',
        zValidator('param', z.object({ id: z.string() })),
        async (c) => {
            const { id } = c.req.valid('param');
            const user = getUser(c);
            const data = await getConnectedAccount(id, user.id);
            if (!data) {
                return c.json({ error: 'Not Found' }, 404);
            }
            return c.json(data);
        }
    )
    .post(
        '/create',
        zValidator(
            'json',
            InsertConnectedAccountSchema.pick({
                bankId: true,
                name: true,
                type: true
            })
        ),
        async (c) => {
            const values = c.req.valid('json');
            const data = await createConnectedAccounts(values);
            return c.json(data, 201);
        }
    );

export default app;
