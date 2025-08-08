import { labelServiceSchemas } from '@/features/label/schemas';
import { getUser } from '@/lib/auth';
import { endpointSelectSchema } from '@/lib/schemas';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';
import { labelServices } from './services';

const app = new Hono()
    /**
     * GET /labels/flattened - Get all labels flattened
     */
    .get('/flattened', zValidator('query', labelServiceSchemas.filter), async (c) => {
        return withRoute(c, async () => {
            const user = getUser(c);
            const { search, parentId } = c.req.valid('query');
            return await labelServices.getAllFlattened({
                userId: user.id,
                filters: { search, parentId },
            });
        });
    })

    /**
     * GET /labels - Get all labels for the authenticated user
     */
    .get('/', zValidator('query', labelServiceSchemas.filter), async (c) => {
        return withRoute(c, async () => {
            const user = getUser(c);
            const { search } = c.req.query();
            return await labelServices.getAll({ userId: user.id, filters: { search } });
        });
    })

    /**
     * GET /labels/roots - Get root labels with nested children for the authenticated user
     */
    .get('/roots', async (c) => {
        return withRoute(c, async () => {
            const user = getUser(c);
            return await labelServices.getRootLabels({ userId: user.id });
        });
    })
    /**
     * GET /labels/:id - Get a specific label by ID for the authenticated user
     */
    .get('/:id', zValidator('param', endpointSelectSchema), async (c) => {
        return withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            const label = await labelServices.getById({ id, userId: user.id });

            if (!label) {
                throw new Error('Label not found');
            }

            return label;
        });
    })
    /**
     * POST /labels - Create a new label for the authenticated user
     */
    .post('/', zValidator('json', labelServiceSchemas.insert), async (c) => {
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
     * PUT /labels/:id - Update an existing label for the authenticated user
     */
    .put(
        '/:id',
        zValidator('param', endpointSelectSchema),
        zValidator('json', labelServiceSchemas.update),
        async (c) => {
            return withRoute(c, async () => {
                const user = getUser(c);
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');

                const label = await labelServices.update({ id, data, userId: user.id });

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
    .delete('/:id', zValidator('param', endpointSelectSchema), async (c) => {
        return withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');

            const label = await labelServices.remove({ id, userId: user.id });

            if (!label) {
                throw new Error('Label not found');
            }

            return { success: true };
        });
    })
    /**
     * PUT /labels/reorder - Bulk reorder labels for drag and drop operations
     */
    .put('/reorder', zValidator('json', labelServiceSchemas.reorder), async (c) => {
        return withRoute(c, async () => {
            const user = getUser(c);
            const { updates } = c.req.valid('json');

            const updatedLabels = await labelServices.reorder({
                updates,
                userId: user.id,
            });

            return {
                success: true,
                updatedLabels,
                count: updatedLabels.length,
            };
        });
    });

export default app;
