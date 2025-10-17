import { labelSchemas } from '@/features/label/schemas';
import { routeHandler } from '@/server/lib/route';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';
import { labelServices } from './services';

const app = new Hono()
    .get('/flattened', zValidator('query', labelSchemas.getFlattened.endpoint.query), (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) =>
                labelServices.getFlattened({
                    userId,
                    filters: validatedInput.query,
                })
            )
    )

    .put('/reorder', zValidator('json', labelSchemas.reorder.endpoint.json), (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) =>
                labelServices.reorder({
                    items: validatedInput.json.items,
                    userId,
                })
            )
    )

    .get('/', zValidator('query', labelSchemas.getMany.endpoint.query), (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) => {
                const { page, pageSize, ...filters } = validatedInput.query;
                return labelServices.getMany({
                    filters,
                    pagination: { page, pageSize },
                    userId,
                });
            })
    )

    .get('/:id', zValidator('param', labelSchemas.getById.endpoint.param), (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) =>
                labelServices.getById({ ids: validatedInput.param, userId })
            )
    )

    .post('/', zValidator('json', labelSchemas.create.endpoint.json), (c) =>
        routeHandler(c)
            .withUser()
            .handleMutation(async ({ userId, validatedInput }) =>
                labelServices.create({ data: validatedInput.json, userId })
            )
    )

    .patch(
        '/:id',
        zValidator('param', labelSchemas.updateById.endpoint.param),
        zValidator('json', labelSchemas.updateById.endpoint.json),
        (c) =>
            routeHandler(c)
                .withUser()
                .handle(async ({ userId, validatedInput }) =>
                    labelServices.updateById({
                        ids: validatedInput.param,
                        data: validatedInput.json,
                        userId,
                    })
                )
    )

    .delete('/:id', zValidator('param', labelSchemas.removeById.endpoint.param), (c) =>
        routeHandler(c)
            .withUser()
            .handleMutation(async ({ userId, validatedInput }) =>
                labelServices.removeById({ ids: { id: validatedInput.param.id }, userId })
            )
    );
export default app;
