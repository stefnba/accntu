import { globalBankAccountSchemas } from '@/features/bank/schemas/global-bank-account';
import { globalBankAccountServices } from '@/features/bank/server/services/global-bank-account';
import { routeHandler } from '@/server/lib/route';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

export const adminGlobalBankAccountEndpoints = new Hono()

    // Get all global bank accounts by bank id
    .get('/', zValidator('query', globalBankAccountSchemas.getMany.endpoint.query), (c) =>
        routeHandler(c)
            .withUser()
            .withAdmin()
            .handle(async ({ validatedInput }) => {
                const { page, pageSize, ...filters } = validatedInput.query;
                return globalBankAccountServices.getMany({
                    filters,
                    pagination: { page, pageSize },
                });
            })
    )

    // Get a global bank account by id
    .get('/:id', zValidator('param', globalBankAccountSchemas.getById.endpoint.param), (c) =>
        routeHandler(c)
            .withUser()
            .withAdmin()
            .handle(async ({ validatedInput }) =>
                globalBankAccountServices.getById({ ids: { id: validatedInput.param.id } })
            )
    )

    // Create a global bank account
    .post('/', zValidator('json', globalBankAccountSchemas.create.endpoint.json), (c) =>
        routeHandler(c)
            .withUser()
            .withAdmin()
            .handleMutation(async ({ validatedInput }) =>
                globalBankAccountServices.create({ data: validatedInput.json })
            )
    )

    // Update a global bank account
    .patch(
        '/:id',
        zValidator('json', globalBankAccountSchemas.updateById.endpoint.json),
        zValidator('param', globalBankAccountSchemas.updateById.endpoint.param),
        (c) =>
            routeHandler(c)
                .withUser()
                .withAdmin()
                .handleMutation(async ({ validatedInput }) =>
                    globalBankAccountServices.updateById({
                        ids: { id: validatedInput.param.id },
                        data: validatedInput.json,
                    })
                )
    )

    // Delete a global bank account
    .delete(
        '/:id',
        zValidator('param', globalBankAccountSchemas.removeById.endpoint.param),
        (c) =>
            routeHandler(c)
                .withUser()
                .withAdmin()
                .handleMutation(async ({ validatedInput }) =>
                    globalBankAccountServices.removeById({ ids: { id: validatedInput.param.id } })
                )
    )

    // Test global bank account transformation query
    .post(
        '/test-transform-query/:globalBankAccountId',
        zValidator('param', globalBankAccountSchemas.testTransform.endpoint.param),
        (c) =>
            routeHandler(c)
                .withUser()
                .withAdmin()
                .handleMutation(async ({ validatedInput }) =>
                    globalBankAccountServices.testTransform({
                        globalBankAccountId: validatedInput.param.globalBankAccountId,
                    })
                )
    );
