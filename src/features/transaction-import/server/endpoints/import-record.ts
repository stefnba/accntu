import { transactionImportSchemas } from '@/features/transaction-import/schemas/import-record';
import { transactionImportServices } from '@/features/transaction-import/server/services/import-record';
import { routeHandler } from '@/server/lib/route';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

const app = new Hono()
    .get('/', zValidator('query', transactionImportSchemas.getMany.endpoint.query), (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) => {
                const { page, pageSize, ...filters } = validatedInput.query;
                return await transactionImportServices.getMany({
                    userId,
                    filters,
                    pagination: { page, pageSize },
                });
            })
    )

    .get('/:id', zValidator('param', transactionImportSchemas.getById.endpoint.param), (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) =>
                transactionImportServices.getById({ ids: { id: validatedInput.param.id }, userId })
            )
    )

    .post('/', zValidator('json', transactionImportSchemas.create.endpoint.json), (c) =>
        routeHandler(c)
            .withUser()
            .handleMutation(async ({ userId, validatedInput }) =>
                transactionImportServices.create({
                    userId,
                    data: validatedInput.json,
                })
            )
    )

    .post('/:id/activate', zValidator('param', transactionImportSchemas.getById.endpoint.param), (c) =>
        routeHandler(c)
            .withUser()
            .handleMutation(async ({ userId, validatedInput }) =>
                transactionImportServices.activate({
                    ids: { id: validatedInput.param.id },
                    userId,
                })
            )
    )

    .patch(
        '/:id',
        zValidator('param', transactionImportSchemas.updateById.endpoint.param),
        zValidator('json', transactionImportSchemas.updateById.endpoint.json),
        (c) =>
            routeHandler(c)
                .withUser()
                .handleMutation(async ({ userId, validatedInput }) =>
                    transactionImportServices.updateById({
                        ids: { id: validatedInput.param.id },
                        userId,
                        data: validatedInput.json,
                    })
                )
    )

    .delete('/:id', zValidator('param', transactionImportSchemas.removeById.endpoint.param), (c) =>
        routeHandler(c)
            .withUser()
            .handleMutation(async ({ userId, validatedInput }) =>
                transactionImportServices.removeById({
                    ids: { id: validatedInput.param.id },
                    userId,
                })
            )
    );

export default app;