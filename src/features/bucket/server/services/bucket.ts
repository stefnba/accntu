import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import {
    bucket,
    bucketParticipant,
    insertBucketSchema,
    updateBucketSchema,
} from '@/features/bucket/server/db/schemas';
import { TQueryUpdateUserRecord } from '@/lib/schemas';
import { db } from '@/server/db';
import { bucketQueries } from '../db/queries/bucket';
import { bucketTransactionServices } from './transaction-bucket';

const createBucket = async (
    data: z.infer<typeof insertBucketSchema>,
    userId: string,
    participantIds: string[]
) => {
    return await db.transaction(async (tx) => {
        const [newBucket] = await tx
            .insert(bucket)
            .values({ ...data, userId })
            .returning();

        if (participantIds.length > 0) {
            const participantsData = participantIds.map((participantId) => ({
                bucketId: newBucket.id,
                participantId,
            }));
            await tx.insert(bucketParticipant).values(participantsData);
        }

        return newBucket;
    });
};

const updateBucket = async (
    params: TQueryUpdateUserRecord<z.infer<typeof updateBucketSchema>>,
    participantIds?: string[]
) => {
    return await db.transaction(async (tx) => {
        const [updatedBucket] = await tx
            .update(bucket)
            .set(params.data)
            .where(and(eq(bucket.id, params.id), eq(bucket.userId, params.userId)))
            .returning();

        if (participantIds) {
            // Delete existing participants for this bucket
            await tx.delete(bucketParticipant).where(eq(bucketParticipant.bucketId, params.id));

            // Insert new participants if any are provided
            if (participantIds.length > 0) {
                const participantsData = participantIds.map((participantId) => ({
                    bucketId: params.id,
                    participantId,
                }));
                await tx.insert(bucketParticipant).values(participantsData);
            }
        }

        if (!updatedBucket) {
            throw new Error('Failed to update bucket');
        }
        return updatedBucket;
    });
};

const deleteBucket = async (bucketId: string, userId: string) => {
    // Soft delete the bucket itself. Ownership is checked in the query.
    const deletedBucket = await bucketQueries.remove({ id: bucketId, userId });

    if (!deletedBucket) {
        throw new Error('Failed to delete bucket');
    }
    return deletedBucket;
};

const updateBucketPaidAmount = async ({
    bucketId,
    userId,
    paidAmount,
}: {
    bucketId: string;
    userId: string;
    paidAmount: string;
}) => {
    const updatedBucket = await bucketQueries.updatePaidAmount({
        id: bucketId,
        userId,
        paidAmount,
    });

    if (!updatedBucket) {
        throw new Error('Failed to update bucket paid amount');
    }

    return updatedBucket;
};

const assignTransactionToBucket = async ({
    transactionId,
    bucketId,
    userId,
    notes,
}: {
    transactionId: string;
    bucketId: string;
    userId: string;
    notes?: string;
}) => {
    return await bucketTransactionServices.assignTransactionToBucket({
        transactionId,
        bucketId,
        userId,
        notes,
    });
};

const removeTransactionFromBucket = async (transactionId: string) => {
    return await bucketTransactionServices.removeTransactionFromBucket(transactionId);
};

export const bucketServices = {
    createBucket,
    updateBucket,
    deleteBucket,
    updateBucketPaidAmount,
    assignTransactionToBucket,
    removeTransactionFromBucket,
    getBucketById: bucketQueries.getById,
    getAllBuckets: bucketQueries.getAll,
    bucketTransaction: bucketTransactionServices,
};
