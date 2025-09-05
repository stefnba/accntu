import { globalBankAccountSchemas } from '@/features/bank/schemas/global-bank-account';
import { globalBankAccountServices } from '@/features/bank/server/services/global-bank-account';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

const app = new Hono()
    /**
     * Get global bank accounts by bank ID
     */
    .get('/', zValidator('query', globalBankAccountSchemas.getMany.endpoint.query), async (c) =>
        withRoute(c, async () => {
            const { page, pageSize, ...filters } = c.req.valid('query');
            return await globalBankAccountServices.getMany({
                filters,
                pagination: {
                    page,
                    pageSize,
                },
            });
        })
    )

    /**
     * Get global bank account by ID
     */
    .get('/:id', zValidator('param', globalBankAccountSchemas.getById.endpoint.param), async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            return await globalBankAccountServices.getById({ ids: { id } });
        })
    );

export default app;
