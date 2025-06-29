import { globalBankAccountServices } from '@/features/bank/server/services/global-bank-account';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
    /**
     * Get global bank accounts by bank ID
     */
    .get('/by-bank/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            return await globalBankAccountServices.getAll({
                filters: {
                    globalBankId: id,
                },
            });
        })
    )

    /**
     * Get global bank account by ID
     */
    .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            const account = await globalBankAccountServices.getById({ id });
            if (!account) {
                throw new Error('Global bank account not found');
            }
            return account;
        })
    )

    /**
     * Get global bank account with CSV config
     */
    .get('/:id/csv-config', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            // This function needs to be implemented in queries
            throw new Error('CSV config endpoint not yet implemented');
        })
    );

export default app;
