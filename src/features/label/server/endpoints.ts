import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { insertLabelSchema, updateLabelSchema } from './db/schema';
import { labelServices } from './services';

const app = new Hono()
    /**
     * GET /labels - Get all labels for the authenticated user
     */
    .get('/', async (c) => {
        return withRoute(c, async () => {
            const user = getUser(c);
            return await labelServices.getAll({ userId: user.id });
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
    .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
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
    .post('/', zValidator('json', insertLabelSchema), async (c) => {
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
        zValidator('param', z.object({ id: z.string() })),
        zValidator('json', updateLabelSchema),
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
    .delete('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
        return withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');

            const label = await labelServices.remove({ id, userId: user.id });

            if (!label) {
                throw new Error('Label not found');
            }

            return { success: true };
        });
    });

export default app;
