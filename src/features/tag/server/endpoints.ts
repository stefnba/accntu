import { tagSchemas } from '@/features/tag/schemas';
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
            return await tagServices.getMany({ userId: user.id });
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
    .post('/', zValidator('json', tagSchemas.create.endpoint), async (c) =>
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
        zValidator('json', tagSchemas.updateById.endpoint),
        async (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');
                return await tagServices.updateById({ id, data, userId: user.id });
            })
    )

    // Delete a tag (soft delete)
    .delete('/:id', zValidator('param', endpointSelectSchema), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            await tagServices.removeById({ id, userId: user.id });
            return { success: true };
        })
    )

    // Assign tags to a transaction
    .put(
        '/assign/:id',
        zValidator('param', endpointSelectSchema),
        zValidator('json', tagSchemas.assignToTransaction.endpoint),
        async (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { tagIds } = c.req.valid('json');
                const { id } = c.req.valid('param');

                console.log('assigning tags to transaction', id, tagIds);

                return await tagServices.assignToTransaction({
                    transactionId: id,
                    tagIds,
                    userId: user.id,
                });
            })
    );

export default app;
