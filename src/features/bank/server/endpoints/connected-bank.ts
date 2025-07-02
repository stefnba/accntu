import { createConnectedBankWithAccountsSchema } from '@/features/bank/schemas/connected-bank';
import { connectedBankServices } from '@/features/bank/server/services/connected-bank';
import { getUser } from '@/lib/auth';
import { withMutationRoute, withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
    /**
     * Get all connected banks for the current user
     */
    .get('/', async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            return await connectedBankServices.getAll({ userId: user.id });
        })
    )

    /**
     * Get a connected bank by id for the current user
     */
    .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            const user = getUser(c);
            const bank = await connectedBankServices.getById({ id, userId: user.id });
            if (!bank) {
                throw new Error('Connected bank not found');
            }
            return bank;
        })
    )

    /**
     * Create a new connected bank together with the related bank accounts
     */
    .post('/', zValidator('json', createConnectedBankWithAccountsSchema), async (c) =>
        withMutationRoute(c, async () => {
            const user = getUser(c);
            const data = c.req.valid('json');

            const connectedBank = await connectedBankServices.create({
                userId: user.id,
                data,
            });
            return connectedBank;
        })
    );

export default app;
