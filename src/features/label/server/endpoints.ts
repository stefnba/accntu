import { labelSchemas } from '@/features/label/schemas';
import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { routeHandler } from '@/server/lib/route';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';
import { labelServices } from './services';

const app = new Hono()
    /**
     * GET /labels/flattened - Get all labels flattened
     */
    .get('/flattened', zValidator('query', labelSchemas.getFlattened.endpoint.query), async (c) => {
        return withRoute(c, async () => {
            const user = getUser(c);
            const filters = c.req.valid('query');
            return await labelServices.getFlattened({
                userId: user.id,
                filters,
            });
        });
    })

    /**
     * PUT /labels/reorder - Bulk reorder labels for drag and drop operations
     */
    .put('/reorder', zValidator('json', labelSchemas.reorder.endpoint.json), async (c) => {
        return withRoute(c, async () => {
            const user = getUser(c);
            const items = c.req.valid('json');

            const result = await labelServices.reorder({
                items: items.items,
                userId: user.id,
            });

            return result;
        });
    })

    /**
     * GET /labels - Get all labels for the authenticated user
     */
    .get('/', zValidator('query', labelSchemas.getMany.endpoint.query), async (c) => {
        return withRoute(c, async () => {
            const user = getUser(c);
            const query = c.req.valid('query');
            return await labelServices.getMany({
                userId: user.id,
                filters: { search: query.search, parentId: query.parentId },
                pagination: { page: query.page, pageSize: query.pageSize },
            });
        });
    })

    /**
     * GET /labels/:id - Get a specific label by ID for the authenticated user
     */
    .get('/:id', zValidator('param', labelSchemas.getById.endpoint.param), async (c) => {
        return withRoute(c, async () => {
            const user = getUser(c);
            const ids = c.req.valid('param');
            const label = await labelServices.getById({ ids, userId: user.id });

            if (!label) {
                throw new Error('Label not found');
            }

            return label;
        });
    })
    /**
     * POST /labels - Create a new label for the authenticated user
     */
    .post('/', zValidator('json', labelSchemas.create.endpoint.json), async (c) => {
        return withRoute(
            c,
            async () => {
                const user = getUser(c);
                const data = c.req.valid('json');
                return await labelServices.create({ data, userId: user.id });
            },
            201
        );
    })
    /**
     * PATCH /labels/:id - Update an existing label for the authenticated user
     */
    .patch(
        '/:id',
        zValidator('param', labelSchemas.updateById.endpoint.param),
        zValidator('json', labelSchemas.updateById.endpoint.json),
        async (c) => {
            return withRoute(c, async () => {
                const user = getUser(c);
                const ids = c.req.valid('param');
                const data = c.req.valid('json');

                const label = await labelServices.updateById({ ids, data, userId: user.id });

                if (!label) {
                    throw new Error('Label not found');
                }

                return label;
            });
        }
    )
    /**
     * DELETE /labels/:id - Soft delete a label for the authenticated user
     */
    .delete('/:id', zValidator('param', labelSchemas.removeById.endpoint.param), async (c) =>
        routeHandler(c)
            .withUser()
            .handleMutation(async ({ userId, validatedInput }) =>
                labelServices.removeById({ ids: { id: validatedInput.param.id }, userId })
            )
    );
export default app;
