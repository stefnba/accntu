import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';
import { z } from 'zod';

import { insertBucketSchema, updateBucketSchema } from '@/features/bucket/server/db/schemas';
import { bucketServices } from '@/features/bucket/server/services/bucket';
import { getUser } from '@/lib/auth/server';
import { endpointSelectSchema } from '@/lib/schemas';
import { withRoute } from '@/server/lib/handler';

const apiInsertBucketSchema = insertBucketSchema.extend({
    participantIds: z.array(z.string()).optional().default([]),
});

const apiUpdateBucketSchema = updateBucketSchema.extend({
    participantIds: z.array(z.string()).optional(),
});

const app = new Hono()
    .get('/', (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const buckets = await bucketServices.getAllBuckets(user.id);
            return c.json(buckets);
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
            return c.json(bucket);
        })
    )
    .post('/', zValidator('json', apiInsertBucketSchema), (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { participantIds, ...data } = c.req.valid('json');
            const newBucket = await bucketServices.createBucket(data, user.id, participantIds);
            return c.json(newBucket, 201);
        })
    )
    .put(
        '/:id',
        zValidator('param', endpointSelectSchema),
        zValidator('json', apiUpdateBucketSchema),
        (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { id } = c.req.valid('param');
                const { participantIds, ...data } = c.req.valid('json');
                const updatedBucket = await bucketServices.updateBucket(
                    {
                        id,
                        data,
                        userId: user.id,
                    },
                    participantIds
                );
                return c.json(updatedBucket);
            })
    )
    .delete('/:id', zValidator('param', endpointSelectSchema), (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            await bucketServices.deleteBucket(id, user.id);
            return c.json({
                success: true,
            });
        })
    )
    // Transaction assignment endpoints
    .post(
        '/:id/transactions/:transactionId',
        zValidator(
            'param',
            z.object({
                id: z.string(),
                transactionId: z.string(),
            })
        ),
        zValidator(
            'json',
            z
                .object({
                    notes: z.string().optional(),
                })
                .optional()
        ),
        (c) =>
            withRoute(
                c,
                async () => {
                    const user = getUser(c);
                    const { id: bucketId, transactionId } = c.req.valid('param');
                    const body = c.req.valid('json');

                    const assignment = await bucketServices.assignTransactionToBucket({
                        transactionId,
                        bucketId,
                        userId: user.id,
                        notes: body?.notes,
                    });

                    return assignment;
                },
                201
            )
    )
    .delete(
        '/:id/transactions/:transactionId',
        zValidator(
            'param',
            z.object({
                id: z.string(),
                transactionId: z.string(),
            })
        ),
        (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { transactionId } = c.req.valid('param');

                await bucketServices.removeTransactionFromBucket(transactionId);

                return { success: true };
            })
    )
    // Update paid amount for SplitWise integration
    .patch(
        '/:id/paid-amount',
        zValidator('param', endpointSelectSchema),
        zValidator(
            'json',
            z.object({
                paidAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
            })
        ),
        (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { id } = c.req.valid('param');
                const { paidAmount } = c.req.valid('json');

                const updatedBucket = await bucketServices.updateBucketPaidAmount({
                    bucketId: id,
                    userId: user.id,
                    paidAmount,
                });

                return updatedBucket;
            })
    );

export const bucketController = app;
