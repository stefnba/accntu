import { insertTransactionBucketSchema } from '@/features/bucket/server/db/schemas';
import { transactionBucketQueries } from '@/features/bucket/server/db/queries/transaction-bucket';
import { bucketQueries } from '@/features/bucket/server/db/queries/bucket';

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
    const existingAssignment = await transactionBucketQueries.getByTransactionId(transactionId);
    
    if (existingAssignment) {
        throw new Error(`Transaction is already assigned to bucket: ${existingAssignment.bucketId}`);
    }

    // Verify bucket exists and belongs to user
    const bucket = await bucketQueries.getById(bucketId, userId);
    if (!bucket) {
        throw new Error('Bucket not found or access denied');
    }

    // Create the assignment
    const assignment = await transactionBucketQueries.create({
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
    await transactionBucketQueries.removeByTransactionId(transactionId);

    // Create new assignment
    return await assignTransactionToBucket({
        transactionId,
        bucketId: newBucketId,
        userId,
        notes,
    });
};

const removeTransactionFromBucket = async (transactionId: string) => {
    const existingAssignment = await transactionBucketQueries.getByTransactionId(transactionId);
    
    if (!existingAssignment) {
        throw new Error('Transaction is not assigned to any bucket');
    }

    return await transactionBucketQueries.removeByTransactionId(transactionId);
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
    const assignment = await transactionBucketQueries.getByTransactionId(transactionId);
    
    if (!assignment) {
        throw new Error('Transaction is not assigned to any bucket');
    }

    // Verify bucket belongs to user
    const bucket = await bucketQueries.getById(assignment.bucketId, userId);
    if (!bucket) {
        throw new Error('Bucket not found or access denied');
    }

    return await transactionBucketQueries.updateSplitWiseStatus(assignment.id, isRecorded);
};

const getTransactionBucket = async (transactionId: string) => {
    return await transactionBucketQueries.getByTransactionId(transactionId);
};

const getBucketTransactions = async (bucketId: string) => {
    return await transactionBucketQueries.getByBucketId(bucketId);
};

export const transactionBucketServices = {
    assignTransactionToBucket,
    reassignTransactionToBucket,
    removeTransactionFromBucket,
    updateSplitWiseStatus,
    getTransactionBucket,
    getBucketTransactions,
};