import { globalBankAccountSchemas } from '@/features/bank/schemas/global-bank-account';
import { globalBankAccountServices } from '@/features/bank/server/services/global-bank-account';
import { routeHandler } from '@/server/lib/route';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

export const adminGlobalBankAccountEndpoints = new Hono()

    // Get all global bank accounts by bank id
    .get('/', zValidator('query', globalBankAccountSchemas.getMany.endpoint.query), async (c) =>
        routeHandler(c)
            .withUser()
            .withAdmin()
            .handle(async ({ validatedInput }) =>
                globalBankAccountServices.getMany({
                    filters: validatedInput.query,
                    pagination: { page: 1, pageSize: 10 },
                })
            )
    )

    // Get a global bank account by id
    .get('/:id', zValidator('param', globalBankAccountSchemas.getById.endpoint.param), async (c) =>
        routeHandler(c)
            .withUser()
            .withAdmin()
            .handle(async ({ validatedInput }) =>
                globalBankAccountServices.getById({ ids: { id: validatedInput.param.id } })
            )
    )

    // Create a global bank account
    .post('/', zValidator('json', globalBankAccountSchemas.create.endpoint.json), async (c) =>
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
        async (c) =>
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
        async (c) =>
            routeHandler(c)
                .withUser()
                .withAdmin()
                .handleMutation(async ({ validatedInput }) =>
                    globalBankAccountServices.removeById({ ids: { id: validatedInput.param.id } })
                )
    )

    // Test global bank account transformation query
    .post(
        '/test-transform-query',
        zValidator('json', globalBankAccountSchemas.testTransform.endpoint.json),
        async (c) =>
            routeHandler(c)
                .withUser()
                .withAdmin()
                .handleMutation(async ({ validatedInput }) =>
                    globalBankAccountServices.testTransform({
                        transformQuery: validatedInput.json.transformQuery,
                        sampleTransformData: validatedInput.json.sampleTransformData,
                        transformConfig: validatedInput.json.transformConfig,
                    })
                )
    );
