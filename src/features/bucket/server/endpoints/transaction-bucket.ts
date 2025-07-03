import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';
import { z } from 'zod';

import { bucketTransactionServices } from '@/features/bucket/server/services/transaction-bucket';
import { getUser } from '@/lib/auth/server';
import { withRoute } from '@/server/lib/handler';

const assignTransactionSchema = z.object({
    bucketId: z.string().min(1, 'Bucket ID is required'),
    notes: z.string().optional(),
});

const reassignTransactionSchema = z.object({
    newBucketId: z.string().min(1, 'New bucket ID is required'),
    notes: z.string().optional(),
});

const updateSplitWiseStatusSchema = z.object({
    isRecorded: z.boolean(),
});

const app = new Hono()
    // Get transaction bucket assignment
    .get(
        '/:transactionId',
        zValidator(
            'param',
            z.object({
                transactionId: z.string(),
            })
        ),
        (c) =>
            withRoute(c, async () => {
                const { transactionId } = c.req.valid('param');
                const assignment =
                    await bucketTransactionServices.getbucketTransaction(transactionId);

                if (!assignment) {
                    return c.json({ error: 'Transaction is not assigned to any bucket' }, 404);
                }

                return assignment;
            })
    )
    // Assign transaction to bucket
    .post(
        '/:transactionId',
        zValidator(
            'param',
            z.object({
                transactionId: z.string(),
            })
        ),
        zValidator('json', assignTransactionSchema),
        (c) =>
            withRoute(
                c,
                async () => {
                    const user = getUser(c);
                    const { transactionId } = c.req.valid('param');
                    const { bucketId, notes } = c.req.valid('json');

                    const assignment = await bucketTransactionServices.assignTransactionToBucket({
                        transactionId,
                        bucketId,
                        userId: user.id,
                        notes,
                    });

                    return assignment;
                },
                201
            )
    )
    // Reassign transaction to different bucket
    .put(
        '/:transactionId',
        zValidator(
            'param',
            z.object({
                transactionId: z.string(),
            })
        ),
        zValidator('json', reassignTransactionSchema),
        (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { transactionId } = c.req.valid('param');
                const { newBucketId, notes } = c.req.valid('json');

                const assignment = await bucketTransactionServices.reassignTransactionToBucket({
                    transactionId,
                    newBucketId,
                    userId: user.id,
                    notes,
                });

                return assignment;
            })
    )
    // Remove transaction from bucket
    .delete(
        '/:transactionId',
        zValidator(
            'param',
            z.object({
                transactionId: z.string(),
            })
        ),
        (c) =>
            withRoute(c, async () => {
                const { transactionId } = c.req.valid('param');

                await bucketTransactionServices.removeTransactionFromBucket(transactionId);

                return { success: true };
            })
    )
    // Update SplitWise status
    .patch(
        '/:transactionId/splitwise-status',
        zValidator(
            'param',
            z.object({
                transactionId: z.string(),
            })
        ),
        zValidator('json', updateSplitWiseStatusSchema),
        (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { transactionId } = c.req.valid('param');
                const { isRecorded } = c.req.valid('json');

                const updatedAssignment = await bucketTransactionServices.updateSplitWiseStatus({
                    transactionId,
                    isRecorded,
                    userId: user.id,
                });

                return updatedAssignment;
            })
    )
    // Get all transactions for a bucket
    .get(
        '/bucket/:bucketId',
        zValidator(
            'param',
            z.object({
                bucketId: z.string(),
            })
        ),
        (c) =>
            withRoute(c, async () => {
                const { bucketId } = c.req.valid('param');
                const transactions =
                    await bucketTransactionServices.getBucketTransactions(bucketId);

                return transactions;
            })
    );

export const bucketTransactionController = app;
