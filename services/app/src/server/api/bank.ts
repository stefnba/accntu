import { db } from '@/db/client';
import { zValidator } from '@hono/zod-validator';
import { getAccountsByBankId, getBank, getBanks } from '@server/services/bank';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
    .get(
        '/',
        zValidator('query', z.object({ country: z.string().optional() })),
        async (c) => {
            const { country } = c.req.valid('query');
            const data = await getBanks(country);
            return c.json(data);
        }
    )
    .post('/', (c) => c.json('create an author', 201))
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

            const data = await getBank(id);

            if (!data) {
                return c.json({ error: 'Not Found' }, 404);
            }

            return c.json(data);
        }
    )
    .get(
        '/:id/accounts',
        zValidator(
            'param',
            z.object({
                id: z.string()
            })
        ),
        async (c) => {
            const { id } = c.req.valid('param');

            const data = await getAccountsByBankId(id);

            if (!data) {
                return c.json({ error: 'Not Found' }, 404);
            }

            return c.json(data);
        }
    );

export default app;
