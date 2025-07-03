import { bucketQueries } from '@/features/bucket/server/db/queries/bucket';
import { bucketTransactionQueries } from '@/features/bucket/server/db/queries/transaction-bucket';

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
    // Check if transaction is already assigned to a bucket
    const existingAssignment = await bucketTransactionQueries.getByTransactionId(transactionId);

    if (existingAssignment) {
        throw new Error(
            `Transaction is already assigned to bucket: ${existingAssignment.bucketId}`
        );
    }

    // Verify bucket exists and belongs to user
    const bucket = await bucketQueries.getById(bucketId, userId);
    if (!bucket) {
        throw new Error('Bucket not found or access denied');
    }

    // Create the assignment
    const assignment = await bucketTransactionQueries.create({
        transactionId,
        bucketId,
        notes,
        splitShare: '100.00', // Default to 100% for now
        isRecorded: false,
    });

    return assignment;
};

const reassignTransactionToBucket = async ({
    transactionId,
    newBucketId,
    userId,
    notes,
}: {
    transactionId: string;
    newBucketId: string;
    userId: string;
    notes?: string;
}) => {
    // Remove existing assignment if any
    await bucketTransactionQueries.removeByTransactionId(transactionId);

    // Create new assignment
    return await assignTransactionToBucket({
        transactionId,
        bucketId: newBucketId,
        userId,
        notes,
    });
};

const removeTransactionFromBucket = async (transactionId: string) => {
    const existingAssignment = await bucketTransactionQueries.getByTransactionId(transactionId);

    if (!existingAssignment) {
        throw new Error('Transaction is not assigned to any bucket');
    }

    return await bucketTransactionQueries.removeByTransactionId(transactionId);
};

const updateSplitWiseStatus = async ({
    transactionId,
    isRecorded,
    userId,
}: {
    transactionId: string;
    isRecorded: boolean;
    userId: string;
}) => {
    const assignment = await bucketTransactionQueries.getByTransactionId(transactionId);

    if (!assignment) {
        throw new Error('Transaction is not assigned to any bucket');
    }

    // Verify bucket belongs to user
    const bucket = await bucketQueries.getById(assignment.bucketId, userId);
    if (!bucket) {
        throw new Error('Bucket not found or access denied');
    }

    return await bucketTransactionQueries.updateSplitWiseStatus(assignment.id, isRecorded);
};

const getbucketTransaction = async (transactionId: string) => {
    return await bucketTransactionQueries.getByTransactionId(transactionId);
};

const getBucketTransactions = async (bucketId: string) => {
    return await bucketTransactionQueries.getByBucketId(bucketId);
};

export const bucketTransactionServices = {
    assignTransactionToBucket,
    reassignTransactionToBucket,
    removeTransactionFromBucket,
    updateSplitWiseStatus,
    getbucketTransaction,
    getBucketTransactions,
};
