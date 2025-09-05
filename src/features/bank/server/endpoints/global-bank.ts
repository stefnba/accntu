import { globalBankSchemas } from '@/features/bank/schemas/global-bank';
import { globalBankServices } from '@/features/bank/server/services/global-bank';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

const app = new Hono()
    /**
     * Get all global banks or search with optional query/country filters
     */
    .get('/', zValidator('query', globalBankSchemas.getMany.endpoint.query), async (c) =>
        withRoute(c, async () => {
            const { page, pageSize, ...filters } = c.req.valid('query');

            return await globalBankServices.getMany({
                filters,
                pagination: {
                    page,
                    pageSize,
                },
            });
        })
    )

    /**
     * Get global bank by ID
     */
    .get('/:id', zValidator('param', globalBankSchemas.getById.endpoint.param), async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            const bank = await globalBankServices.getById({ ids: { id } });
            if (!bank) {
                throw new Error('Global bank not found');
            }
            return bank;
        })
    );

export default app;
