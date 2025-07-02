import { apiClient, createMutation, createQuery } from '@/lib/api';

export const TRANSACTION_BUCKET_QUERY_KEYS = {
    ASSIGNMENT: 'transaction-bucket-assignment',
    BUCKET_TRANSACTIONS: 'bucket-transactions',
} as const;

export const useTransactionBucketEndpoints = {
    // Get transaction bucket assignment
    getAssignment: createQuery(
        apiClient.buckets.transaction[':transactionId'].$get,
        TRANSACTION_BUCKET_QUERY_KEYS.ASSIGNMENT
    ),

    // Get all transactions for a bucket
    getBucketTransactions: createQuery(
        apiClient.buckets.transaction.bucket[':bucketId'].$get,
        TRANSACTION_BUCKET_QUERY_KEYS.BUCKET_TRANSACTIONS
    ),

    // Assign transaction to bucket
    assign: createMutation(
        apiClient.buckets.transaction[':transactionId'].$post,
        TRANSACTION_BUCKET_QUERY_KEYS.ASSIGNMENT
    ),

    // Reassign transaction to different bucket
    reassign: createMutation(
        apiClient.buckets.transaction[':transactionId'].$put,
        TRANSACTION_BUCKET_QUERY_KEYS.ASSIGNMENT
    ),

    // Remove transaction from bucket
    remove: createMutation(
        apiClient.buckets.transaction[':transactionId'].$delete,
        TRANSACTION_BUCKET_QUERY_KEYS.ASSIGNMENT
    ),

    // Update SplitWise status
    updateSplitWiseStatus: createMutation(
        apiClient.buckets.transaction[':transactionId']['splitwise-status'].$patch,
        TRANSACTION_BUCKET_QUERY_KEYS.ASSIGNMENT
    ),
};
