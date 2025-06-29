import { connectedBankAccountServiceSchemas } from '@/features/bank/schemas/connected-bank-account';
import { connectedBankAccountServices } from '@/features/bank/server/services/connected-bank-account';
import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()

    /**
     * Get connected bank account by ID
     */
    .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            const user = getUser(c);
            const account = await connectedBankAccountServices.getById({ id, userId: user.id });
            if (!account) {
                throw new Error('Connected bank account not found');
            }
            return account;
        })
    )

    /**
     * Create a connected bank account
     */
    .post('/', zValidator('json', connectedBankAccountServiceSchemas.create), async (c) =>
        withRoute(
            c,
            async () => {
                const user = getUser(c);
                const data = c.req.valid('json');
                return await connectedBankAccountServices.create({
                    userId: user.id,
                    data,
                });
            },
            201
        )
    )

    /**
     * Update a connected bank account
     */
    .put(
        '/:id',
        zValidator('param', z.object({ id: z.string() })),
        zValidator('json', connectedBankAccountServiceSchemas.update),
        async (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');
                return await connectedBankAccountServices.update({
                    id,
                    userId: user.id,
                    data,
                });
            })
    );

export default app;
