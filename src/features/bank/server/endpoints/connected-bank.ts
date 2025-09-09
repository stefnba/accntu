import { connectedBankSchemas } from '@/features/bank/schemas/connected-bank';
import { connectedBankServices } from '@/features/bank/server/services/connected-bank';
import { routeHandler } from '@/server/lib/route';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

const app = new Hono()
    /**
     * Get all connected banks for the current user
     */
    .get('/', zValidator('query', connectedBankSchemas.getMany.endpoint.query), async (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ validatedInput, userId }) =>
                connectedBankServices.getMany({
                    filters: validatedInput.query,
                    pagination: validatedInput.query,
                    userId,
                })
            )
    )

    /**
     * Get a connected bank by id for the current user
     */
    .get('/:id', zValidator('param', connectedBankSchemas.getById.endpoint.param), async (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ validatedInput, userId }) =>
                connectedBankServices.getById({ ids: { id: validatedInput.param.id }, userId })
            )
    )

    /**
     * Create a new connected bank together with the related bank accounts
     */
    .post('/', zValidator('json', connectedBankSchemas.create.endpoint.json), async (c) =>
        routeHandler(c)
            .withUser()
            .handleMutation(async ({ validatedInput, userId }) =>
                connectedBankServices.createWithAccounts({
                    userId,
                    data: {
                        ...validatedInput.json,
                        connectedBankAccounts: validatedInput.json.connectedBankAccounts,
                    },
                })
            )
    );

export default app;
