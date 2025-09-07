import { bucketSchemas } from '@/features/bucket/schemas';
import { bucketServices } from '@/features/bucket/server/services';
import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

// Create Hono app with proper chaining for RPC type generation
const app = new Hono()
    // Get all buckets for authenticated user
    .get('/', zValidator('query', bucketSchemas.getMany.endpoint.query), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { page, pageSize, ...filters } = c.req.valid('query');
            return await bucketServices.getMany({
                pagination: {
                    page,
                    pageSize,
                },
                filters,
                userId: user.id,
            });
        })
    )

    // Get bucket by ID
    .get('/:id', zValidator('param', bucketSchemas.getById.endpoint.param), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            const bucket = await bucketServices.getById({ ids: { id }, userId: user.id });

            if (!bucket) {
                throw new Error('Bucket not found');
            }

            return bucket;
        })
    )

    // Create a new bucket
    .post('/', zValidator('json', bucketSchemas.create.endpoint.json), async (c) =>
        withRoute(
            c,
            async () => {
                const user = getUser(c);
                const data = c.req.valid('json');
                return await bucketServices.create({ data, userId: user.id });
            },
            201
        )
    )

    // Update a bucket
    .put(
        '/:id',
        zValidator('param', bucketSchemas.updateById.endpoint.param),
        zValidator('json', bucketSchemas.updateById.endpoint.json),
        async (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');
                return await bucketServices.updateById({ ids: { id }, data, userId: user.id });
            })
    )

    // Delete a bucket (soft delete)
    .delete('/:id', zValidator('param', bucketSchemas.removeById.endpoint.param), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            await bucketServices.removeById({ ids: { id }, userId: user.id });
            return { success: true };
        })
    );

export default app;
