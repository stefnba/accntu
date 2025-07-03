import { apiClient, createMutation, createQuery } from '@/lib/api';

export const bucket_transaction_QUERY_KEYS = {
    ASSIGNMENT: 'transaction-bucket-assignment',
    BUCKET_TRANSACTIONS: 'bucket-transactions',
} as const;

export const usebucketTransactionEndpoints = {
    // Get transaction bucket assignment
    getAssignment: createQuery(
        apiClient.buckets.transaction[':transactionId'].$get,
        bucket_transaction_QUERY_KEYS.ASSIGNMENT
    ),

    // Get all transactions for a bucket
    getBucketTransactions: createQuery(
        apiClient.buckets.transaction.bucket[':bucketId'].$get,
        bucket_transaction_QUERY_KEYS.BUCKET_TRANSACTIONS
    ),

    // Assign transaction to bucket
    assign: createMutation(
        apiClient.buckets.transaction[':transactionId'].$post,
        bucket_transaction_QUERY_KEYS.ASSIGNMENT
    ),

    // Reassign transaction to different bucket
    reassign: createMutation(
        apiClient.buckets.transaction[':transactionId'].$put,
        bucket_transaction_QUERY_KEYS.ASSIGNMENT
    ),

    // Remove transaction from bucket
    remove: createMutation(
        apiClient.buckets.transaction[':transactionId'].$delete,
        bucket_transaction_QUERY_KEYS.ASSIGNMENT
    ),

    // Update SplitWise status
    updateSplitWiseStatus: createMutation(
        apiClient.buckets.transaction[':transactionId']['splitwise-status'].$patch,
        bucket_transaction_QUERY_KEYS.ASSIGNMENT
    ),
};
