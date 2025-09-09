import { globalBankSchemas } from '@/features/bank/schemas/global-bank';
import { globalBankServices } from '@/features/bank/server/services/global-bank';
import { routeHandler } from '@/server/lib/route';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

const app = new Hono()
    /**
     * Get all global banks or search with optional query/country filters
     */
    .get('/', zValidator('query', globalBankSchemas.getMany.endpoint.query), async (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ validatedInput }) =>
                globalBankServices.getMany({
                    filters: validatedInput.query,
                    pagination: validatedInput.query,
                })
            )
    )

    /**
     * Get global bank by ID
     */
    .get('/:id', zValidator('param', globalBankSchemas.getById.endpoint.param), async (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ validatedInput }) =>
                globalBankServices.getById({ ids: { id: validatedInput.param.id } })
            )
    );

export default app;
