import { bucketQuerySchemas } from '@/features/bucket/schemas';
import { bucketQueries } from '@/features/bucket/server/db/queries/bucket';
import { bucketParticipantQueries } from '@/features/bucket/server/db/queries/bucket-participant';
import { bucketTransactionServices } from '@/features/bucket/server/services/transaction-bucket';
import { TQueryUpdateUserRecord } from '@/lib/schemas';

const createBucket = async (
    data: typeof bucketQuerySchemas.insert._type,
    user: { id: string; name: string }
) => {
    const newBucket = await bucketQueries.create(data, user.id);

    if (!newBucket) {
        throw new Error('Failed to create bucket');
    }

    // Add the owner as the first participant
    await bucketParticipantQueries.create({
        bucketId: newBucket.id,
        name: user.name,
        userId: user.id,
    });

    return newBucket;
};

const updateBucket = async (
    params: TQueryUpdateUserRecord<typeof bucketQuerySchemas.update._type>
) => {
    // Ownership is already checked in the query by userId
    const updatedBucket = await bucketQueries.update(params);

    if (!updatedBucket) {
        throw new Error('Failed to update bucket');
    }
    return updatedBucket;
};

const deleteBucket = async (bucketId: string, userId: string) => {
    // Soft delete the bucket itself. Ownership is checked in the query.
    const deletedBucket = await bucketQueries.remove({ id: bucketId, userId });

    if (!deletedBucket) {
        throw new Error('Failed to delete bucket');
    }

    // We don't need to delete participants since the schema is set to cascade on delete.
    // However, if we were doing soft deletes on participants too, we would do it here.
    // For now, hard delete of participants is fine when a bucket is soft-deleted.
    // If we want to soft-delete participants, we would call:
    // await bucketParticipantQueries.removeAllForBucket(bucketId);
    // and change removeAllForBucket to do a soft delete.

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
    // Transaction-bucket operations
    bucketTransaction: bucketTransactionServices,
};
