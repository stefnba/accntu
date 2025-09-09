import { globalBankSchemas } from '@/features/bank/schemas/global-bank';
import { globalBankServices } from '@/features/bank/server/services/global-bank';
import { routeHandler } from '@/server/lib/route';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

export const adminGlobalBankEndpoints = new Hono()

    // Get all global banks
    .get('/', zValidator('query', globalBankSchemas.getMany.endpoint.query), async (c) =>
        routeHandler(c)
            .withUser()
            .withAdmin()
            .handle(async ({ validatedInput }) =>
                globalBankServices.getMany({
                    filters: {
                        query: validatedInput.query.query,
                        country: validatedInput.query.country,
                    },
                    pagination: {
                        page: 1,
                        pageSize: 10,
                    },
                })
            )
    )

    // Get a global bank by id
    .get('/:id', zValidator('param', globalBankSchemas.getById.endpoint.param), async (c) =>
        routeHandler(c)
            .withUser()
            .withAdmin()
            .handle(async ({ validatedInput }) =>
                globalBankServices.getById({ ids: { id: validatedInput.param.id } })
            )
    )

    // Create a global bank
    .post('/', zValidator('json', globalBankSchemas.create.endpoint.json), async (c) =>
        routeHandler(c)
            .withUser()
            .withAdmin()
            .handleMutation(async ({ validatedInput }) =>
                globalBankServices.create({ data: validatedInput.json })
            )
    )

    // Update a global bank
    .put(
        '/:id',
        zValidator('json', globalBankSchemas.updateById.endpoint.json),
        zValidator('param', globalBankSchemas.updateById.endpoint.param),
        async (c) =>
            routeHandler(c)
                .withUser()
                .withAdmin()
                .handleMutation(async ({ validatedInput }) =>
                    globalBankServices.updateById({
                        ids: { id: validatedInput.param.id },
                        data: validatedInput.json,
                    })
                )
    )

    // Delete a global bank
    .delete('/:id', zValidator('param', globalBankSchemas.removeById.endpoint.param), async (c) =>
        routeHandler(c)
            .withUser()
            .withAdmin()
            .handleMutation(async ({ validatedInput }) =>
                globalBankServices.removeById({ ids: { id: validatedInput.param.id } })
            )
    );
