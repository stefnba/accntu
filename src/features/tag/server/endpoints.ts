import { tagSchemas, tagToTransactionSchemas } from '@/features/tag/schemas';
import { tagServices } from '@/features/tag/server/services';
import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

// Create Hono app with proper chaining for RPC type generation
const app = new Hono()
    // Get all tags for authenticated user
    .get('/', zValidator('query', tagSchemas.getMany.endpoint.query), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { page, pageSize, ...filters } = c.req.valid('query');
            return await tagServices.getMany({
                pagination: {
                    page,
                    pageSize,
                },
                filters,
                userId: user.id,
            });
        })
    )

    // Get tag by ID
    .get('/:id', zValidator('param', tagSchemas.getById.endpoint.param), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            const tag = await tagServices.getById({ ids: { id }, userId: user.id });

            if (!tag) {
                throw new Error('Tag not found');
            }

            return tag;
        })
    )

    // Create a new tag
    .post('/', zValidator('json', tagSchemas.create.endpoint.json), async (c) =>
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
        zValidator('param', tagSchemas.updateById.endpoint.param),
        zValidator('json', tagSchemas.updateById.endpoint.json),
        async (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');
                return await tagServices.updateById({ ids: { id }, data, userId: user.id });
            })
    )

    // Delete a tag (soft delete)
    .delete('/:id', zValidator('param', tagSchemas.removeById.endpoint.param), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            await tagServices.removeById({ ids: { id }, userId: user.id });
            return { success: true };
        })
    )

    // Assign tags to a transaction
    .put(
        '/assign/:transactionId',
        zValidator('param', tagToTransactionSchemas.assignToTransaction.endpoint.param),
        zValidator('json', tagToTransactionSchemas.assignToTransaction.endpoint.json),
        async (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { tagIds } = c.req.valid('json');
                const { transactionId } = c.req.valid('param');

                console.log('assigning tags to transaction', transactionId, tagIds);

                return await tagServices.assignToTransaction({
                    transactionId,
                    userId: user.id,
                    tagIds,
                });
            })
    );

export default app;
