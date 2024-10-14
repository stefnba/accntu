import {
    GetAccountByBankSchema,
    GetBankSchema,
    GetBanksSchema,
    getAccountsByBankId,
    getBank,
    getBanks
} from '@/server/actions/bank';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

const app = new Hono()
    .get('/', zValidator('query', GetBanksSchema), async (c) => {
        const data = await getBanks(c.req.valid('query'));
        return c.json(data);
    })
    .get('/:id', zValidator('param', GetBankSchema), async (c) => {
        const { id } = c.req.valid('param');
        const data = await getBank({ id });
        if (!data) {
            return c.json({ error: 'Not1111 Found' }, 404);
        }
        return c.json(data);
    })
    .get(
        '/:id/accounts',
        zValidator('param', GetAccountByBankSchema),
        async (c) => {
            const { bankId } = c.req.valid('param');

            const data = await getAccountsByBankId({ bankId });

            if (!data) {
                return c.json({ error: 'Not Found' }, 404);
            }

            return c.json(data);
        }
    );

export default app;
