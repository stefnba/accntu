import { searchGlobalBanksSchema } from '@/features/bank/schemas';
import { globalBankQueries } from '@/features/bank/server/db/queries';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
    /**
     * Get all global banks or search with optional query/country filters
     */
    .get('/', zValidator('query', searchGlobalBanksSchema), async (c) =>
        withRoute(c, async () => {
            const { query, country } = c.req.valid('query') ?? {};

            if (query || country) {
                return await globalBankQueries.search({ query: query || '', country });
            } else {
                return await globalBankQueries.getAll();
            }
        })
    )

    /**
     * Get global bank by ID
     */
    .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            const bank = await globalBankQueries.getById({ id });
            if (!bank) {
                throw new Error('Global bank not found');
            }
            return bank;
        })
    )

    /**
     * Get global banks by country
     */
    .get('/country/:country', zValidator('param', z.object({ country: z.string() })), async (c) =>
        withRoute(c, async () => {
            const { country } = c.req.valid('param');
            return await globalBankQueries.getByCountry({ country });
        })
    );

export default app;
