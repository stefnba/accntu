import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { insertBucketSchema, updateBucketSchema } from '@/features/bucket/server/db/schemas';
import { bucketServices } from '@/features/bucket/server/services/bucket';
import { getUser } from '@/lib/auth/server';
import { endpointSelectSchema } from '@/lib/schemas';
import { withRoute } from '@/server/lib/handler';

const app = new Hono()
    .get('/', (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const buckets = await bucketServices.getAllBuckets(user.id);
            return buckets;
        })
    )
    .get('/:id', zValidator('param', endpointSelectSchema), (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            const bucket = await bucketServices.getBucketById(id, user.id);
            if (!bucket) {
                return c.json({ error: 'Bucket not found' }, 404);
            }
            return bucket;
        })
    )
    .post('/', zValidator('json', insertBucketSchema), (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const data = c.req.valid('json');
            const newBucket = await bucketServices.createBucket(data, user);
            return newBucket;
        })
    )
    .put(
        '/:id',
        zValidator('param', endpointSelectSchema),
        zValidator('json', updateBucketSchema),
        (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');
                const updatedBucket = await bucketServices.updateBucket({
                    id,
                    data,
                    userId: user.id,
                });
                return updatedBucket;
            })
    )
    .delete('/:id', zValidator('param', endpointSelectSchema), (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            await bucketServices.deleteBucket(id, user.id);
            return {
                success: true,
            };
        })
    );

export const bucketController = app;
