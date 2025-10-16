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
            .handle(async ({ userId, validatedInput }) =>
                labelServices.getMany({
                    userId,
                    filters: { search: validatedInput.query.search, parentId: validatedInput.query.parentId },
                    pagination: { page: validatedInput.query.page, pageSize: validatedInput.query.pageSize },
                })
            )
    )

    .get('/:id', zValidator('param', labelSchemas.getById.endpoint.param), (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) => {
                const label = await labelServices.getById({ ids: validatedInput.param, userId });

                if (!label) {
                    throw new Error('Label not found');
                }

                return label;
            })
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
                .handle(async ({ userId, validatedInput }) => {
                    const label = await labelServices.updateById({
                        ids: validatedInput.param,
                        data: validatedInput.json,
                        userId,
                    });

                    if (!label) {
                        throw new Error('Label not found');
                    }

                    return label;
                })
    )

    .delete('/:id', zValidator('param', labelSchemas.removeById.endpoint.param), (c) =>
        routeHandler(c)
            .withUser()
            .handleMutation(async ({ userId, validatedInput }) =>
                labelServices.removeById({ ids: { id: validatedInput.param.id }, userId })
            )
    );
export default app;
