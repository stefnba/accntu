import { tagServiceSchemas } from '@/features/tag/schemas';
import { tagServices } from '@/features/tag/server/services';
import { getUser } from '@/lib/auth';
import { endpointSelectSchema } from '@/lib/schemas';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

// Create Hono app with proper chaining for RPC type generation
const app = new Hono()
    // Get all tags for authenticated user
    .get('/', async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            return await tagServices.getAll({ userId: user.id });
        })
    )

    // Get tag by ID
    .get('/:id', zValidator('param', endpointSelectSchema), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            const tag = await tagServices.getById({ id, userId: user.id });

            if (!tag) {
                throw new Error('Tag not found');
            }

            return tag;
        })
    )

    // Create a new tag
    .post('/', zValidator('json', tagServiceSchemas.create), async (c) =>
        withRoute(
            c,
            async () => {
                const user = getUser(c);
                const data = c.req.valid('json');
                return await tagServices.create({ data, userId: user.id });
            },
            201
        )
    )

    // Update a tag
    .put(
        '/:id',
        zValidator('param', endpointSelectSchema),
        zValidator('json', tagServiceSchemas.update),
        async (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');
                return await tagServices.update({ id, data, userId: user.id });
            })
    )

    // Delete a tag (soft delete)
    .delete('/:id', zValidator('param', endpointSelectSchema), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            await tagServices.remove({ id, userId: user.id });
            return { success: true };
        })
    );

export default app;
