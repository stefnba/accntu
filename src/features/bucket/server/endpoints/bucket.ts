import { Hono } from 'hono';

import { bucketServiceSchemas } from '@/features/bucket/schemas';
import { bucketServices } from '@/features/bucket/server/services/bucket';
import { getUser } from '@/lib/auth';
import { endpointSelectSchema } from '@/lib/schemas';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';

const app = new Hono()

    // Get all buckets
    .get('/', async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            return await bucketServices.getAll({ userId: user.id });
        })
    )

    // Get a bucket by ID
    .get('/:id', zValidator('param', endpointSelectSchema), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            const bucket = await bucketServices.getById({ id, userId: user.id });
            return bucket;
        })
    )

    // Create a bucket
    .post('/', zValidator('json', bucketServiceSchemas.create), async (c) =>
        withRoute(
            c,
            async () => {
                const user = getUser(c);
                const data = c.req.valid('json');
                return await bucketServices.create({
                    userId: user.id,
                    data,
                });
            },
            201
        )
    )

    // Update a bucket
    .put(
        '/:id',
        zValidator('param', endpointSelectSchema),
        zValidator('json', bucketServiceSchemas.update),
        async (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');

                return await bucketServices.update({
                    id,
                    userId: user.id,
                    data,
                });
            })
    )

    // Delete a bucket
    .delete('/:id', zValidator('param', endpointSelectSchema), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            return await bucketServices.remove({ id, userId: user.id });
        })
    );

export default app;
