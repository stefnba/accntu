import {
    insertConnectedBankAccountSchema,
    updateConnectedBankAccountSchema,
} from '@/features/bank/schemas';
import { connectedBankAccountQueries } from '@/features/bank/server/db/queries';
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
            const account = await connectedBankAccountQueries.getById({ id });
            if (!account) {
                throw new Error('Connected bank account not found');
            }
            return account;
        })
    )

    /**
     * Create a connected bank account
     */
    .post('/', zValidator('json', insertConnectedBankAccountSchema), async (c) =>
        withRoute(
            c,
            async () => {
                const data = c.req.valid('json');
                return await connectedBankAccountQueries.create({ data });
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
        zValidator('json', updateConnectedBankAccountSchema),
        async (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');

                // Note: This needs an update function in queries that handles user validation
                throw new Error(
                    'Update endpoint not yet implemented - needs query function update'
                );
            })
    );

export default app;
