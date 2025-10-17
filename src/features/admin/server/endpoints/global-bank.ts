import { globalBankSchemas } from '@/features/bank/schemas/global-bank';
import { globalBankServices } from '@/features/bank/server/services/global-bank';
import { routeHandler } from '@/server/lib/route';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

export const adminGlobalBankEndpoints = new Hono()

    // Get all global banks
    .get('/', zValidator('query', globalBankSchemas.getMany.endpoint.query), (c) =>
        routeHandler(c)
            .withUser()
            .withAdmin()
            .handle(async ({ validatedInput }) => {
                const { page, pageSize, ...filters } = validatedInput.query;
                return globalBankServices.getMany({
                    filters,
                    pagination: { page, pageSize },
                });
            })
    )

    // Get a global bank by id
    .get('/:id', zValidator('param', globalBankSchemas.getById.endpoint.param), (c) =>
        routeHandler(c)
            .withUser()
            .withAdmin()
            .handle(async ({ validatedInput }) =>
                globalBankServices.getById({ ids: { id: validatedInput.param.id } })
            )
    )

    // Create a global bank
    .post('/', zValidator('json', globalBankSchemas.create.endpoint.json), (c) =>
        routeHandler(c)
            .withUser()
            .withAdmin()
            .handleMutation(async ({ validatedInput }) =>
                globalBankServices.create({ data: validatedInput.json })
            )
    )

    // Update a global bank
    .patch(
        '/:id',
        zValidator('json', globalBankSchemas.updateById.endpoint.json),
        zValidator('param', globalBankSchemas.updateById.endpoint.param),
        (c) =>
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
    .delete('/:id', zValidator('param', globalBankSchemas.removeById.endpoint.param), (c) =>
        routeHandler(c)
            .withUser()
            .withAdmin()
            .handleMutation(async ({ validatedInput }) =>
                globalBankServices.removeById({ ids: { id: validatedInput.param.id } })
            )
    );
