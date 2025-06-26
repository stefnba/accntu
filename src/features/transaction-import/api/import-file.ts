import { apiClient, createMutation, createQuery } from '@/lib/api';

const TRANSACTION_IMPORT_FILE_QUERY_KEYS = {
    FILES: 'transaction-import-files',
    FILE: 'transaction-import-file',
} as const;

/**
 * Transaction Import File API endpoints
 */
export const useImportFileEndpoints = {
    /**
     * Create/upload a new import file
     */
    create: createMutation(
        apiClient['transaction-import'].files.$post,
        TRANSACTION_IMPORT_FILE_QUERY_KEYS.FILES
    ),

    /**
     * Get files by import ID
     */
    getByImport: createQuery(
        apiClient['transaction-import'].files.import[':importId'].$get,
        TRANSACTION_IMPORT_FILE_QUERY_KEYS.FILES
    ),

    /**
     * Get file by ID
     */
    get: createQuery(
        apiClient['transaction-import'].files[':id'].$get,
        TRANSACTION_IMPORT_FILE_QUERY_KEYS.FILE
    ),

    /**
     * Update file status
     */
    updateStatus: createMutation(
        apiClient['transaction-import'].files[':id'].status.$put,
        TRANSACTION_IMPORT_FILE_QUERY_KEYS.FILE
    ),

    /**
     * Parse transactions from file
     */
    parse: createMutation(
        apiClient['transaction-import'].files[':id'].parse.$post,
        TRANSACTION_IMPORT_FILE_QUERY_KEYS.FILE
    ),

    /**
     * Delete file
     */
    delete: createMutation(
        apiClient['transaction-import'].files[':id'].$delete,
        TRANSACTION_IMPORT_FILE_QUERY_KEYS.FILES
    ),

    /**
     * Create signed URL for file upload
     */
    createS3SignedUrl: createMutation(
        apiClient['transaction-import'].files.upload['signed-url'].$post,
        TRANSACTION_IMPORT_FILE_QUERY_KEYS.FILE
    ),

    /**
     * Delete file from S3
     */
    deleteS3File: createMutation(
        apiClient['transaction-import'].files.upload['delete-file'].$delete,
        TRANSACTION_IMPORT_FILE_QUERY_KEYS.FILE
    ),
};
