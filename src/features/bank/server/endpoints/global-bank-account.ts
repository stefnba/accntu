import { globalBankAccountSchemas } from '@/features/bank/schemas/global-bank-account';
import { globalBankAccountServices } from '@/features/bank/server/services/global-bank-account';
import { routeHandler } from '@/server/lib/route';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

const app = new Hono()
    /**
     * Get global bank accounts by bank ID
     */
    .get('/', zValidator('query', globalBankAccountSchemas.getMany.endpoint.query), async (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ validatedInput }) =>
                globalBankAccountServices.getMany({
                    filters: validatedInput.query,
                    pagination: validatedInput.query,
                })
            )
    )

    /**
     * Get global bank account by ID
     */
    .get('/:id', zValidator('param', globalBankAccountSchemas.getById.endpoint.param), async (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ validatedInput }) =>
                globalBankAccountServices.getById({ ids: { id: validatedInput.param.id } })
            )
    );

export default app;
