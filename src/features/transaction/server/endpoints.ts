import { transactionSchemas } from '@/features/transaction/schemas';
import {
    createMany,
    getFilterOptions,
    transactionServices,
} from '@/features/transaction/server/services';
import { routeHandler } from '@/server/lib/route';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
    .get('/', zValidator('query', transactionSchemas.getMany.endpoint.query), (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) => {
                const { page, pageSize, ...filters } = validatedInput.query;

                return await transactionServices.getMany({
                    userId,
                    filters,
                    pagination: { page, pageSize },
                });
            })
    )

    .get('/filter-options', (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId }) => getFilterOptions(userId))
    )

    .get('/:id', zValidator('param', transactionSchemas.getById.endpoint.param), (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) =>
                transactionServices.getById({
                    userId,
                    ids: validatedInput.param,
                })
            )
    )

    .patch(
        '/:id',
        zValidator('param', transactionSchemas.updateById.endpoint.param),
        zValidator('json', transactionSchemas.updateById.endpoint.json),
        (c) =>
            routeHandler(c)
                .withUser()
                .handle(async ({ userId, validatedInput }) =>
                    transactionServices.updateById({
                        ids: validatedInput.param,
                        data: validatedInput.json,
                        userId,
                    })
                )
    )

    .delete('/:id', zValidator('param', transactionSchemas.removeById.endpoint.param), (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) =>
                transactionServices.removeById({
                    ids: validatedInput.param,
                    userId,
                })
            )
    )

    .post('/', zValidator('json', transactionSchemas.create.endpoint.json), (c) =>
        routeHandler(c)
            .withUser()
            .handleMutation(async ({ userId, validatedInput }) =>
                transactionServices.create({
                    data: validatedInput.json,
                    userId,
                })
            )
    )

    .post(
        '/import',
        zValidator(
            'json',
            z.object({
                transactions: z.array(z.any()),
                importFileId: z.string(),
            })
        ),
        (c) =>
            routeHandler(c)
                .withUser()
                .handle(async ({ userId, validatedInput }) => {
                    const { transactions, importFileId } = validatedInput.json;

                    return await createMany({
                        userId,
                        transactions,
                        importFileId,
                    });
                })
    );

export default app;
