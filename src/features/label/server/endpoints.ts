import { createLabelSchema, updateLabelFormSchema } from '@/features/label/schemas';
import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { validateLabelHierarchy } from '../utils';
import * as queries from './db/queries';

// Create Hono app with proper chaining for RPC type generation
const app = new Hono()
    // Get all labels for authenticated user
    .get('/', async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            return await queries.getLabelsByUserId({ userId: user.id });
        })
    )

    // Get label by ID
    .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            const label = await queries.getLabelById({ id });

            if (!label) {
                throw new Error('Label not found');
            }

            return label;
        })
    )

    // Get label hierarchy for authenticated user
    .get('/hierarchy', async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            return await queries.getLabelHierarchy({ userId: user.id });
        })
    )

    // Get root labels for authenticated user
    .get('/root', async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            return await queries.getRootLabels({ userId: user.id });
        })
    )

    // Get child labels for a parent label
    .get(
        '/:parentId/children',
        zValidator('param', z.object({ parentId: z.string() })),
        async (c) =>
            withRoute(c, async () => {
                const { parentId } = c.req.valid('param');
                return await queries.getChildLabels({ parentId });
            })
    )

    // Create a new label
    .post('/', zValidator('json', createLabelSchema), async (c) =>
        withRoute(
            c,
            async () => {
                const user = getUser(c);
                const data = c.req.valid('json');

                // Validate hierarchy if parent is specified
                if (data.parentId) {
                    const allLabels = await queries.getLabelsByUserId({ userId: user.id });
                    const error = validateLabelHierarchy(data.parentId, '', allLabels);
                    if (error) {
                        throw new Error(error);
                    }
                }

                return await queries.createLabel({
                    data: {
                        ...data,
                        userId: user.id,
                        isDeleted: false,
                    },
                });
            },
            201
        )
    )

    // Update a label
    .put(
        '/:id',
        zValidator('param', z.object({ id: z.string() })),
        zValidator('json', updateLabelFormSchema),
        async (c) =>
            withRoute(c, async () => {
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');

                // Validate hierarchy if parent is being changed
                if (data.parentId) {
                    const user = getUser(c);
                    const allLabels = await queries.getLabelsByUserId({ userId: user.id });
                    const error = validateLabelHierarchy(data.parentId, id, allLabels);
                    if (error) {
                        throw new Error(error);
                    }
                }

                const updatedLabel = await queries.updateLabel({ id, data });

                if (!updatedLabel) {
                    throw new Error('Label not found');
                }

                return updatedLabel;
            })
    )

    // Delete a label (soft delete)
    .delete('/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            await queries.deleteLabel({ id });
            return { success: true };
        })
    );

export default app;
